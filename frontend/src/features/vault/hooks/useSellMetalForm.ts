import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/features/app/apiError";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";
import { formatGrams } from "../format";
import { sellGramsSchema, type SellGramsForm } from "../schema";
import type { VaultProduct } from "../types";
import { useSellMetalMutation } from "../vaultApi";

type Params = {
  product: VaultProduct;
  pricePerGramPaisa: number | null;
  priceUpdatedAt: string | null;
  balanceGrams: number | null;
  minCashoutGrams: number | null;
  isLoadingVault: boolean;
};

export function useSellMetalForm({
  product,
  pricePerGramPaisa,
  priceUpdatedAt,
  balanceGrams,
  minCashoutGrams,
  isLoadingVault,
}: Params) {
  const [sellMetal, { isLoading: isSelling }] = useSellMetalMutation();
  const pendingKey = useRef<{
    key: string;
    grams: number;
    product: VaultProduct;
  } | null>(null);
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);

  function getIdempotencyKey(grams: number): string {
    // Reuse the key only for the same metal and weight. A retry cannot
    // double-sell, while changing either starts a new request.
    if (
      !pendingKey.current ||
      pendingKey.current.grams !== grams ||
      pendingKey.current.product !== product
    ) {
      pendingKey.current = {
        key: crypto.randomUUID(),
        grams,
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
  } = useForm<SellGramsForm>({
    resolver: zodResolver(sellGramsSchema),
  });

  const grams = Number(watch("grams"));
  const hasPrice = pricePerGramPaisa !== null && pricePerGramPaisa > 0;
  const balance = balanceGrams ?? 0;
  const minimum = minCashoutGrams ?? 0;
  const isValidNumber = Number.isFinite(grams) && grams > 0;
  const belowMinimum = isValidNumber && minimum > 0 && grams < minimum;
  const aboveBalance =
    isValidNumber && balanceGrams !== null && grams > balance;
  const estimatedPaisa =
    hasPrice && isValidNumber
      ? Math.floor(grams * pricePerGramPaisa)
      : null;
  const cannotMeetMinimum = balanceGrams !== null && balance < minimum;

  const presets = [0.25, 0.5, 1]
    .map((fraction) => ({
      fraction,
      grams: Math.floor(balance * fraction),
      label: fraction === 1 ? "Max" : `${fraction * 100}%`,
    }))
    .filter((preset) => preset.grams >= 1);

  async function onSubmit(values: SellGramsForm) {
    const requestedGrams = values.grams;
    if (minimum > 0 && requestedGrams < minimum) {
      setError("grams", {
        message: `Minimum cash-out is ${formatGrams(minimum)}`,
      });
      return;
    }
    if (balanceGrams !== null && requestedGrams > balance) {
      setError("grams", { message: "Not enough metal to cash out" });
      return;
    }

    try {
      const result = await sellMetal({
        product,
        grams: values.grams,
        idempotency_key: getIdempotencyKey(values.grams),
      }).unwrap();
      pendingKey.current = null;
      toast.success(result.message);
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Could not cash out ${lowerLabel}`));
    }
  }

  function selectPreset(gramsToSell: number) {
    setValue("grams", gramsToSell, { shouldValidate: true });
  }

  const canSubmit =
    !isSelling &&
    !isLoadingVault &&
    hasPrice &&
    balanceGrams !== null &&
    !cannotMeetMinimum &&
    isValidNumber &&
    !belowMinimum &&
    !aboveBalance;

  return {
    presets,
    label,
    lowerLabel,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    estimatedPaisa,
    belowMinimum,
    aboveBalance,
    cannotMeetMinimum,
    hasPrice,
    isLoadingVault,
    priceUpdatedAt,
    balanceGrams,
    minCashoutGrams,
    isSelling,
    canSubmit,
    selectPreset,
    minimum,
    balance,
  };
}
