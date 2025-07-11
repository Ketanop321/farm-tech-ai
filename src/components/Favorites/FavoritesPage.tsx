import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, MessageCircle, Trash2 } from 'lucide-react';
import ProductList from '../Product/ProductList';
import { useAuth } from '../../hooks/useAuth';
import { productsAPI } from '../../services/api';

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // Load favorites from localStorage for now
      const savedFavorites = localStorage.getItem(`favorites_${user?.id}`) || '[]';
      const favoriteIds = JSON.parse(savedFavorites);
      setFavorites(favoriteIds);

      if (favoriteIds.length > 0) {
        // Load all products and filter favorites
        const response = await productsAPI.getAll();
        const allProducts = response.data;
        const favoriteProductsList = allProducts.filter((product: any) => 
          favoriteIds.includes(product.id)
        );
        setFavoriteProducts(favoriteProductsList);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (productId: string) => {
    const updatedFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(updatedFavorites));
    
    // Update favorite products list
    if (!updatedFavorites.includes(productId)) {
      setFavoriteProducts(favoriteProducts.filter(product => product.id !== productId));
    }
  };

  const handleAddToCart = (productId: string) => {
    // This would be handled by the parent component
    console.log('Add to cart:', productId);
  };

  const handleProductClick = (productId: string) => {
    // This would be handled by the parent component
    console.log('Product clicked:', productId);
  };

  const handleChatWithFarmer = (farmerId: string, farmerName: string) => {
    // This would be handled by the parent component
    console.log('Chat with farmer:', farmerId, farmerName);
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    setFavoriteProducts([]);
    localStorage.setItem(`favorites_${user?.id}`, JSON.stringify([]));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Heart className="h-8 w-8 text-red-500" />
            <span>My Favorites</span>
          </h1>
          <p className="text-gray-600">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'} in your favorites
          </p>
        </div>
        
        {favoriteProducts.length > 0 && (
          <button
            onClick={clearAllFavorites}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Favorites List */}
      {favoriteProducts.length > 0 ? (
        <ProductList
          products={favoriteProducts}
          onAddToCart={handleAddToCart}
          onProductClick={handleProductClick}
          onChatWithFarmer={handleChatWithFarmer}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
        />
      ) : (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-6">
            Start adding products to your favorites by clicking the heart icon on any product.
          </p>
          <button
            onClick={() => window.location.href = '#products'}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      )}

      {/* Quick Stats */}
      {favoriteProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Favorites Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {favoriteProducts.length}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{favoriteProducts.reduce((sum, product) => sum + product.price, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(favoriteProducts.map(p => p.category)).size}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;