import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WORDPRESS_API_URL = 'https://public-api.wordpress.com/rest/v1.1/sites/nithindidigam.wordpress.com/posts/';

const BlogPost: React.FC = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${WORDPRESS_API_URL}${id}`);
        const data = await res.json();
        setPost(data);
      } catch {
        setPost(null);
      }
      setLoading(false);
    };
    if (id) fetchPost();
  }, [id]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        ) : !post ? (
          <div className="text-center text-gray-500 py-12">Blog post not found.</div>
        ) : (
          <div>
            <Link to="/#blogs-section" className="text-blue-600 hover:underline mb-4 inline-block">
              &larr; Back to Blogs
            </Link>
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{post.title}</h1>
            <div className="text-gray-400 mb-4 text-xs">{new Date(post.date).toLocaleDateString()}</div>
            <img
              src={post.featured_image || 'https://placehold.co/600x300?text=No+Image'}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
            <div
              className="prose max-w-none text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogPost;
