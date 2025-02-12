import {
  Button,
  Container,
  Flex,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useProductStore } from "../store/product";
import ProductCard from "../components/ProductCard";
import { useProductStore } from "../store/product.js";

const HomePage = () => {
  const [pageNumber, setPageNumber] = useState(1);

  const { fetchProducts, products, productCount } = useProductStore();

  useEffect(() => {
    fetchProducts(pageNumber);
  }, [fetchProducts, pageNumber]);

  const totalPagination = Math.floor(productCount / 3);
  console.log("products.length", totalPagination);
  const handlePagination = (selectedPage) => {
    setPageNumber(selectedPage);
  };

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8}>
        <Text
          fontSize={"30"}
          fontWeight={"bold"}
          bgGradient={"linear(to-r, cyan.400, blue.500)"}
          bgClip={"text"}
          textAlign={"center"}
        >
          Current Products 🚀
        </Text>

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            lg: 3,
          }}
          spacing={10}
          w={"full"}
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </SimpleGrid>
        <Flex gap={4}>
          {Array(totalPagination)
            .fill()
            .map((data, index) => (
              <Button
                key={index}
                color={"#000000"}
                onClick={() => handlePagination(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
        </Flex>
        {products.length === 0 && (
          <Text
            fontSize="xl"
            textAlign={"center"}
            fontWeight="bold"
            color="gray.500"
          >
            No products found 😢{" "}
            {/* <Link to={"/create"}>
              <Text
                as="span"
                color="blue.500"
                _hover={{ textDecoration: "underline" }}
              >
                Create a product
              </Text>
            </Link> */}
          </Text>
        )}
      </VStack>
    </Container>
  );
};
export default HomePage;
