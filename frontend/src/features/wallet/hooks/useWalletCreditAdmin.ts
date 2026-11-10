import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/features/app/apiError";
import { formatRupees } from "@/features/vault/format";
import {
  adminCreditRupeesSchema,
  MAX_ADMIN_CREDIT_RUPEES,
  type AdminCreditRupeesForm,
} from "../schema";
import { useAdminCreditMutation } from "../walletApi";

export function useWalletCreditAdmin() {
  const [adminCredit, { isLoading }] = useAdminCreditMutation();
  const idempotencyKey = useRef<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminCreditRupeesForm>({
    resolver: zodResolver(adminCreditRupeesSchema),
  });

  function getPendingKey(): string {
    // Reuse the key until a credit succeeds, so retrying a failed request
    // cannot create a second ledger row.
    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }
    return idempotencyKey.current;
  }

  async function onSubmit(values: AdminCreditRupeesForm) {
    try {
      const result = await adminCredit({
        user_email: values.user_email,
        amount_paisa: Math.round(values.amount_rupees * 100),
        description: values.description?.trim() || undefined,
        idempotency_key: getPendingKey(),
      }).unwrap();

      toast.success(
        `${result.message}. Balance ${formatRupees(result.balance_paisa)}`,
      );
      idempotencyKey.current = crypto.randomUUID();
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not credit the wallet"));
    }
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    maxAmountRupees: MAX_ADMIN_CREDIT_RUPEES,
  };
}
