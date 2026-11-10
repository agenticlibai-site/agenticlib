import SolutionPage, { solutionMetadata } from "../_shared/SolutionPage";
import { getSolution } from "../_shared/solutions";

const s = getSolution("trades-ai");

export const metadata = solutionMetadata(s);

export default function TradesSolutionPage() {
  return <SolutionPage s={s} />;
}
