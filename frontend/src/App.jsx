import "./App.css";
import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import Subscribe from "./pages/subscribe";
import Navbar from "./components/Navbar";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/subscribe" element={<Subscribe />} />
        </Routes>
      </Box>
      {/* <Navbar />
      <Subscribe />
      <CreatePage />
      <HomePage /> */}
    </BrowserRouter>
  );
}

export default App;
