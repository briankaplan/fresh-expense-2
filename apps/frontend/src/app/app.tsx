import { Layout } from 'antd';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '@/router';

const { Header, Content, Footer } = Layout;

export function App() {
  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between px-6">
        <h1 className="text-white text-xl">Fresh Expense</h1>
      </Header>
      <Content className="p-6">
        <RouterProvider router={router} />
      </Content>
      <Footer className="text-center">
        Fresh Expense ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default App;
