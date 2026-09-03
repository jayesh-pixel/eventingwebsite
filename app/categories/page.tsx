"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { categories as categoriesConfig } from "@/utils/config";

interface Category {
  _id: string;
  Name: string;
  Description: string | null;
  Images: Array<{
    image_path: string;
    _id: string;
  }>;
  Priority: number;
  status: number;
}

interface ApiResponse {
  error: boolean;
  message: string;
  data: Category[];
}

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<ApiResponse>(categoriesConfig.GET_ALL);
        
        if (response.data && !response.data.error) {
          setCategories(response.data.data || []);
        } else {
          console.error('API Error:', response.data.message);
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            All <span className="text-blue-500">Categories</span>
          </h1>
          <p className="text-gray-400">Explore events by category</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden animate-pulse">
                <div className="h-40 sm:h-48 bg-slate-800"></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category._id}`}
                className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                <div className="relative h-40 sm:h-48 overflow-hidden bg-slate-800">
                  {category.Images && category.Images.length > 0 ? (
                    <img
                      src={
                        category.Images[0].image_path.startsWith("http")
                          ? category.Images[0].image_path
                          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${category.Images[0].image_path}`
                      }
                      alt={category.Name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-4xl sm:text-5xl font-bold drop-shadow-lg">
                        {category.Name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className="text-white font-bold text-sm sm:text-base group-hover:text-blue-400 transition-colors drop-shadow-md">
                      {category.Name}
                    </h3>
                    {category.Description && (
                      <p className="text-gray-300 text-xs sm:text-sm line-clamp-1 mt-1 drop-shadow-md">
                        {category.Description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
