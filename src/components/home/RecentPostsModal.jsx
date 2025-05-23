import { useState } from "react";

export default function RecentPostsModal({ posts }) {
  const [openPost, setOpenPost] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white shadow-md overflow-hidden flex flex-col h-full">
            <div className="w-full h-64 overflow-hidden">
              <img
                src={post.image || "/default-post.jpg"}
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 p-4">{post.title}</h3>
              <p className="text-base text-gray-800 mb-6 p-4">{post.shortDescription}</p>
              <div className="mt-auto">
                <button
                  onClick={() => setOpenPost(post)}
                  className="w-full block text-center bg-green-700 text-white font-bold py-3 rounded-none text-lg transition-colors hover:bg-green-800 flex items-center justify-center"
                >
                  Read More
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {openPost && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
          <div className="h-full w-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-black bg-opacity-50">
              <h2 className="text-2xl font-bold text-white">{openPost.title}</h2>
              <button
                onClick={() => setOpenPost(null)}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Image Section */}
              <div className="w-full md:w-1/2 relative">
                <img
                  src={openPost.image || "/default-post.jpg"}
                  alt={openPost.title}
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Description Section */}
              <div className="w-full md:w-1/2 p-8 bg-white overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-3xl font-bold mb-6">{openPost.title}</h3>
                  <div className="prose prose-lg">
                    <p className="text-gray-700">{openPost.shortDescription}</p>
                    {openPost.content && (
                      <div className="mt-6">
                        {openPost.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 