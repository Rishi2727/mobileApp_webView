import { Loader } from "@/components/ui/custom/loader";
import useLoaderStore from "@/store/useLoaderStore";

const GlobalLoader = () => {
  const { isLoading, text } = useLoaderStore();

  if (!isLoading) return null;

  return (
    <Loader
      fullScreen
      isLoading={isLoading}
      text={text ?? "Loading..."}
      size="lg"
      variant="primary"
    />
  );
};

export default GlobalLoader;
