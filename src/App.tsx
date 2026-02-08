import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components';

function App() {
  return (
    <>
      <Toaster
        position="bottom-center"
        duration={5000}
      />
      <MainLayout />
    </>
  );
}

export default App
