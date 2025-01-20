import { Button } from "@chakra-ui/react";

const Subscribe = () => {
  const handleSubscribe = async (plan) => {
    try {
      const response = await fetch("http://localhost:5000/subscribe", {
        method: "POST", // Use POST instead of GET
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }), // Send plan in the body
      });

      const data = await response.json();
      console.log("data", data);

      if (response.ok && data.url) {
        window.location.href = data.url; // Redirect to the Stripe Checkout URL
      } else {
        alert(data.message || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Error during subscription:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return <Button onClick={() => handleSubscribe("starter")}>subscribe </Button>;
};

export default Subscribe;
