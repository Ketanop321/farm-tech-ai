import React from 'react';
import { ShoppingCart, Heart, Star, MapPin, MessageCircle, Edit } from 'lucide-react';

interface ProductCardProps {
  product: any;
  onAddToCart: (productId: string) => void;
  onProductClick: (productId: string) => void;
  onChatWithFarmer?: (farmerId: string, farmerName: string) => void;
  showEditOptions?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onProductClick,
  onChatWithFarmer,
  showEditOptions = false
}) => {
  const imageUrl = product.images && product.images.length > 0 
    ? `http://localhost:3001${product.images[0]}`
    : 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => onProductClick(product.id)}
        />
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
          <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
        </button>
        {product.stock < 10 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Low Stock
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{product.farmName || 'Farm Name'}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">
              ₹{product.price}
            </span>
            <span className="text-sm text-gray-500">/{product.unit}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {showEditOptions ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onProductClick(product.id);
                }}
                className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm">Edit</span>
              </button>
            ) : (
              <>
                {onChatWithFarmer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatWithFarmer(product.farmerId, product.farmName);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">Chat</span>
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product.id);
                  }}
                  disabled={product.stock === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm font-medium">Add</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {product.stock > 0 ? `${product.stock} ${product.unit} available` : 'Out of stock'}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;