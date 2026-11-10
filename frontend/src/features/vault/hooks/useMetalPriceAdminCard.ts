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
  setSilverPriceRupeesSchema,
  type SetSilverPriceRupeesForm,
} from "../schema";
import type { VaultProduct } from "../types";
import { useSetPriceMutation } from "../vaultApi";

type Params = {
  product: VaultProduct;
  currentPricePerGramPaisa: number | null;
};

export function useMetalPriceAdminCard({
  product,
  currentPricePerGramPaisa,
}: Params) {
  const [setPrice, { isLoading }] = useSetPriceMutation();
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetSilverPriceRupeesForm>({
    resolver: zodResolver(setSilverPriceRupeesSchema),
  });

  async function onSubmit(values: SetSilverPriceRupeesForm) {
    try {
      const result = await setPrice({
        product,
        price_per_gram_paisa: Math.round(values.price_rupees * 100),
        source: "admin",
      }).unwrap();
      toast.success(
        `${label} price set to ${formatRupees(result.price_per_gram_paisa)} / g`,
      );
      reset();
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, `Could not update the ${lowerLabel} price`),
      );
    }
  }

  return {
    label,
    lowerLabel,
    currentPricePerGramPaisa,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
  };
}
