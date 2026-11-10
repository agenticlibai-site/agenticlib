import SolutionPage, { solutionMetadata } from "../_shared/SolutionPage";
import { getSolution } from "../_shared/solutions";

const s = getSolution("video-ai");

export const metadata = solutionMetadata(s);

export default function VideoSolutionPage() {
  return <SolutionPage s={s} />;
}
