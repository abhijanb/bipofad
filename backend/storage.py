"""Reusable upload helper for FastAPI UploadFile.

Example (per-file constants at top of each route file):
    MAX_IMAGE_BYTES = 5 * 1024 * 1024
    ALLOWED_CONTENT_TYPES = {"image"}  # category alias for safe image types
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

    image_path = await save_upload(
        image,
        subdir="posts",
        allowed_content_types=ALLOWED_CONTENT_TYPES,
        allowed_extensions=ALLOWED_EXTENSIONS,
        max_bytes=MAX_IMAGE_BYTES,
    )
    # -> "uploads/posts/<uuid>.png" (relative path, store in DB)

    await delete_upload(image_path)
"""

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from config import settings

_CHUNK_SIZE = 1024 * 1024  # 1MB per read so oversize files fail before loading fully into RAM
_BACKEND_ROOT = Path(__file__).resolve().parent

# Curated safe image types. The "image" category alias expands to this set,
# so callers can write ALLOWED_CONTENT_TYPES = {"image"} instead of
# enumerating MIME types. Exotic/unsafe types (svg, gif, tiff, ...) stay blocked.
IMAGE_CONTENT_TYPES = frozenset({"image/jpeg", "image/png", "image/webp"})
CONTENT_TYPE_ALIASES = {"image": IMAGE_CONTENT_TYPES}


def _resolve_content_types(entries: set[str]) -> set[str]:
    """Expand category aliases to exact MIME types.

    Accepts bare names ("image") and wildcard form ("image/*").
    Anything else passes through as an exact MIME type.
    """
    resolved: set[str] = set()
    for entry in entries:
        normalized = (entry or "").strip().lower()
        if not normalized:
            continue
        major = normalized[:-2] if normalized.endswith("/*") else normalized
        if "/" not in major and major in CONTENT_TYPE_ALIASES:
            resolved.update(CONTENT_TYPE_ALIASES[major])
        elif normalized:
            resolved.add(normalized)
    return resolved


def _format_max_bytes(limit: int) -> str:
    """Human-readable size for error messages (e.g. 5MB, 512KB)."""
    if limit >= 1024 * 1024:
        return f"{limit / (1024 * 1024):g}MB"
    if limit >= 1024:
        return f"{limit // 1024}KB"
    return f"{limit}B"


def get_upload_dir() -> Path:
    """Absolute upload root. Creates it on first use."""
    configured = Path(settings.upload_dir)
    root = configured if configured.is_absolute() else (_BACKEND_ROOT / configured)
    root.mkdir(parents=True, exist_ok=True)
    return root


def resolve_upload_path(relative_path: str) -> Path:
    """Resolve a DB-stored path (e.g. 'uploads/posts/x.png') inside the upload root.

    Raises 400 if the path escapes the upload root (path traversal).
    """
    root = get_upload_dir()
    # Accept both "uploads/posts/x.png" and "posts/x.png" for convenience.
    cleaned = (relative_path or "").strip().lstrip("/")
    prefix = f"{Path(settings.upload_dir).name}/"
    if cleaned.startswith(prefix):
        cleaned = cleaned[len(prefix):]
    candidate = (root / cleaned).resolve()
    if candidate != root and root not in candidate.parents:
        raise HTTPException(status_code=400, detail="Invalid file path")
    return candidate


def _sanitize_subdir(subdir: str) -> Path:
    """Clean optional subdir (e.g. 'posts'). Rejects traversal/absolute paths."""
    cleaned = (subdir or "").strip().strip("/")
    if not cleaned:
        return Path()
    candidate = Path(cleaned)
    if candidate.is_absolute() or ".." in candidate.parts:
        raise HTTPException(status_code=400, detail="Invalid upload directory")
    return candidate


async def save_upload(
    file: UploadFile,
    subdir: str = "",
    allowed_content_types: set[str] | None = None,
    allowed_extensions: set[str] | None = None,
    max_bytes: int | None = None,
) -> str:
    """Validate and persist an UploadFile. Returns DB-friendly relative path.

    Define limits per-file at the top of each route module and pass them
    explicitly. Any omitted arg falls back to settings (global default).
    allowed_content_types accepts exact MIME types ("image/png") and
    category aliases ("image" or "image/*" for the curated safe image types).
    """
    allowed_types = _resolve_content_types(
        allowed_content_types or set(settings.upload_allowed_content_types)
    )
    allowed_exts = allowed_extensions or set(settings.upload_allowed_extensions)
    limit = settings.upload_max_bytes if max_bytes is None else max_bytes

    if (file.content_type or "").strip().lower() not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Only {', '.join(sorted(allowed_exts))} allowed")

    target_dir = get_upload_dir() / _sanitize_subdir(subdir)
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    destination = target_dir / filename

    # Stream to disk with a size cap instead of reading the whole file at once.
    total = 0
    try:
        with destination.open("wb") as out:
            while True:
                chunk = await file.read(_CHUNK_SIZE)
                if not chunk:
                    break
                total += len(chunk)
                if total > limit:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File too large (max {_format_max_bytes(limit)})",
                    )
                await run_in_threadpool(out.write, chunk)
    except HTTPException:
        if destination.exists():
            destination.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    if total == 0:
        destination.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Empty image file")

    # DB stores a path like "uploads/posts/<uuid>.png", served at "/uploads/...".
    upload_root_name = Path(settings.upload_dir).name
    try:
        inner = destination.relative_to(get_upload_dir())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid upload directory")
    return f"{upload_root_name}/{inner.as_posix()}"


async def delete_upload(relative_path: str | None) -> bool:
    """Delete a previously saved upload. Returns True if deleted, False if missing."""
    if not relative_path:
        return False
    path = resolve_upload_path(relative_path)
    if not path.is_file():
        return False
    await run_in_threadpool(path.unlink, missing_ok=True)
    return True


# Serve DB-stored paths like "uploads/posts/<file>" at "/uploads/...".
# Add this to main.py after the app is created:
#     from fastapi.staticfiles import StaticFiles
#     app.mount("/uploads", StaticFiles(directory=get_upload_dir()), name="uploads")