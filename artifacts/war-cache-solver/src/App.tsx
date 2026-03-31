import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Solver from "@/pages/solver";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Solver />
    </QueryClientProvider>
  );
}

export default App;
