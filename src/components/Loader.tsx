import { Loader2 } from "lucide-react";

const Loader = () => (
  <div className="flex justify-center items-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-300" />
  </div>
);

export default Loader;
