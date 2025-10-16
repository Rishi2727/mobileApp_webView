import { Loader } from "./loader";
import { useState } from "react";

// Example usage of the enhanced Loader component with timer functionality
export const LoaderExample = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Loader with Timer Examples</h2>
      
      {/* Basic loader with timeout message */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Basic Loader with Timeout</h3>
        <div className="border rounded p-4 h-32 relative">
          <Loader
            isLoading={isLoading}
            text="Loading notifications..."
            timeout={500}
            timeoutMessage="No notifications found"
            showTimeoutMessage={true}
          />
        </div>
      </div>

      {/* Overlay loader with timeout */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Overlay Loader with Timeout</h3>
        <div className="border rounded p-4 h-32 relative bg-gray-100">
          <p>Some content behind the loader</p>
          <Loader
            isLoading={isLoading}
            overlay={true}
            text="Searching..."
            timeout={1000}
            timeoutMessage="No results found"
            showTimeoutMessage={true}
            size="lg"
          />
        </div>
      </div>

      {/* Full screen loader with custom timeout */}
      <div className="mb-8">
        <button
          onClick={() => setIsLoading(!isLoading)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isLoading ? "Stop Loading" : "Start Loading"}
        </button>
      </div>

      {/* Full screen loader example (commented out to avoid covering the page) */}
      {/* 
      <Loader
        isLoading={isLoading}
        fullScreen={true}
        text="Loading application..."
        timeout={2000}
        timeoutMessage="Taking longer than expected. Please check your connection."
        showTimeoutMessage={true}
        variant="primary"
      />
      */}
    </div>
  );
};