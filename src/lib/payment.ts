export type BankInfo = {
  name: string;
  shortName: string;
  bin: string;
  logo?: string;
};

export const BANKS: BankInfo[] = [
  { name: "Ngân hàng TMCP Quân đội", shortName: "MBBank", bin: "970422" },
  { name: "Ngân hàng TMCP Ngoại thương Việt Nam", shortName: "Vietcombank", bin: "970436" },
  { name: "Ngân hàng TMCP Kỹ thương Việt Nam", shortName: "Techcombank", bin: "970407" },
  { name: "Ngân hàng TMCP Việt Nam Thịnh Vượng", shortName: "VPBank", bin: "970432" },
  { name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam", shortName: "BIDV", bin: "970418" },
  { name: "Ngân hàng Nông nghiệp và PTNT Việt Nam", shortName: "Agribank", bin: "970405" },
  { name: "Ngân hàng TMCP Sài Gòn Thương Tín", shortName: "Sacombank", bin: "970403" },
  { name: "Ngân hàng TMCP Công Thương Việt Nam", shortName: "VietinBank", bin: "970415" },
  { name: "Ngân hàng TMCP Tiên Phong", shortName: "TPBank", bin: "970423" },
  { name: "Ngân hàng TMCP Á Châu", shortName: "ACB", bin: "970416" },
  { name: "Ngân hàng TMCP Hàng Hải Việt Nam", shortName: "MSB", bin: "970426" },
  { name: "Ngân hàng TMCP Bưu điện Liên Việt", shortName: "LPBank", bin: "970449" },
  { name: "Ngân hàng TMCP Sài Gòn – Hà Nội", shortName: "SHB", bin: "970443" },
  { name: "Ngân hàng TMCP Đông Nam Á", shortName: "SeABank", bin: "970440" },
  { name: "Ngân hàng TMCP Phương Đông", shortName: "OCB", bin: "970448" },
  { name: "Ngân hàng TMCP Bản Việt", shortName: "Viet Capital Bank", bin: "970454" },
  { name: "Ngân hàng TMCP Phát triển TP.HCM", shortName: "HDBank", bin: "970437" },
  { name: "Ngân hàng TMCP Nam Á", shortName: "Nam A Bank", bin: "970428" },
  { name: "Ngân hàng TMCP Việt Á", shortName: "VietABank", bin: "970427" },
  { name: "Ngân hàng TMCP Đại chúng Việt Nam", shortName: "PVcomBank", bin: "970412" },
];

export function vietQrUrl(
  bin: string,
  account: string,
  amountVnd: number,
  paymentRef: string,
  accountName: string,
): string {
  const params = new URLSearchParams({
    amount: String(amountVnd),
    addInfo: paymentRef,
    accountName,
  });
  return `https://img.vietqr.io/image/${bin}-${account}-qr_only.jpg?${params.toString()}`;
}

export function generatePaymentRef(type: "DOC" | "CRS"): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${type}-${ts}-${rnd}`;
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}
