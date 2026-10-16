import type { BankAccount } from "@/types/bankAccounts";
import { http } from '@/api/http';

interface BankAccountsResponse {
  data: BankAccount[]
}

export async function getBankAccounts(): Promise<BankAccount[]> {
  const response = await http.get<BankAccountsResponse>('/bank-accounts')

  return response.data
}
