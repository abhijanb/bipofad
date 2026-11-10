import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/features/app/apiError";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";
import { formatRupees } from "../format";
import {
  collectSilverRupeesSchema,
  type CollectSilverRupeesForm,
} from "../schema";
import type { VaultProduct } from "../types";
import { useCollectMetalMutation } from "../vaultApi";

const PRESETS = [10, 50, 100, 500];

type Params = {
  product: VaultProduct;
  pricePerGramPaisa: number | null;
  priceUpdatedAt: string | null;
  balancePaisa: number | null;
  isLoadingPrice: boolean;
};

export function useCollectMetalForm({
  product,
  pricePerGramPaisa,
  priceUpdatedAt,
  balancePaisa,
  isLoadingPrice,
}: Params) {
  const [collectMetal, { isLoading: isCollecting }] =
    useCollectMetalMutation();
  const pendingKey = useRef<{
    key: string;
    amountPaisa: number;
    product: VaultProduct;
  } | null>(null);
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);

  function getIdempotencyKey(amountPaisa: number): string {
    // Reuse the key only for the same metal and amount. A retry of the same
    // purchase cannot double-buy, while changing either starts a new request.
    if (
      !pendingKey.current ||
      pendingKey.current.amountPaisa !== amountPaisa ||
      pendingKey.current.product !== product
    ) {
      pendingKey.current = {
        key: crypto.randomUUID(),
        amountPaisa,
        product,
      };
    }
    return pendingKey.current.key;
  }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<CollectSilverRupeesForm>({
    resolver: zodResolver(collectSilverRupeesSchema),
  });

  const amountRupees = watch("amount_rupees");
  const hasPrice = pricePerGramPaisa !== null && pricePerGramPaisa > 0;
  const amountPaisa = Number.isFinite(amountRupees)
    ? Math.round(amountRupees * 100)
    : 0;
  // Grams are whole units, so the API floors the amount. Show the same number
  // it will actually buy and charge.
  const estimatedGrams =
    pricePerGramPaisa !== null &&
    pricePerGramPaisa > 0 &&
    Number.isFinite(amountRupees)
      ? Math.floor(amountPaisa / pricePerGramPaisa)
      : null;
  const estimatedPaisa =
    estimatedGrams !== null && pricePerGramPaisa !== null
      ? estimatedGrams * pricePerGramPaisa
      : null;
  const tooSmall =
    estimatedGrams !== null && estimatedGrams <= 0 && amountPaisa > 0;
  const insufficient =
    balancePaisa !== null &&
    estimatedPaisa !== null &&
    estimatedPaisa > 0 &&
    estimatedPaisa > balancePaisa;

  async function onSubmit(values: CollectSilverRupeesForm) {
    const requestedPaisa = Math.round(values.amount_rupees * 100);
    if (estimatedGrams !== null && estimatedGrams <= 0) {
      setError("amount_rupees", {
        message: "Amount is too small for 1 gram at the current rate",
      });
      return;
    }
    if (
      estimatedPaisa !== null &&
      balancePaisa !== null &&
      estimatedPaisa > balancePaisa
    ) {
      setError("amount_rupees", { message: "Insufficient balance" });
      return;
    }

    try {
      const result = await collectMetal({
        product,
        amount_paisa: requestedPaisa,
        idempotency_key: getIdempotencyKey(requestedPaisa),
      }).unwrap();
      pendingKey.current = null;
      toast.success(
        `${result.message} for ${formatRupees(result.collection.amount_paisa)}`,
      );
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Could not collect ${lowerLabel}`));
    }
  }

  function selectPreset(amount: number) {
    setValue("amount_rupees", amount, { shouldValidate: true });
  }

  const canSubmit =
    !isCollecting &&
    hasPrice &&
    balancePaisa !== null &&
    !insufficient &&
    !tooSmall;

  return {
    presets: PRESETS,
    label,
    lowerLabel,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    amountPaisa,
    estimatedGrams,
    estimatedPaisa,
    tooSmall,
    insufficient,
    hasPrice,
    isLoadingPrice,
    priceUpdatedAt,
    balancePaisa,
    isCollecting,
    canSubmit,
    selectPreset,
  };
}
