import { Button } from 'antd';

function App() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">React + Vite + Tailwind + AntD setup</h1>
      <Button type="primary" className="!bg-blue-500 !border-blue-500">Ant Design Button</Button>
      <div className="mt-8 text-center">
        <p className="text-gray-600">Tailwind styles applied!</p>
      </div>
    </div>
  );
}

export default App;
