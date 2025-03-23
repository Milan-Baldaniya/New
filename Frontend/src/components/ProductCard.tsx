import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* ... existing product card content ... */}

      {/* Add a new direct bidding button for auction products */}
      {product.bidding && (
        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            navigate(`/live-bidding/${product.id}`);
          }}
        >
          <Gavel className="w-4 h-4 mr-2" />
          Bid Now
        </Button>
      )}
    </div>
  );
};

export default ProductCard; 