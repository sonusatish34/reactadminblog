import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEye,
  faTrash,
  faUpload,
  faPenToSquare,
  faCircleCheck,
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import {
  collection,
  getDocs,
  query,
  doc,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { fireDb } from "../../firebase";
import AdminLayout from "../../layouts/AdminLayout";
import Loading from "../../layouts/Loading";

function PostsData({ postsData, currentPage, itemsPerPage, setPostsData }) {
  const [selectedBlogFor, setSelectedBlogFor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Extract unique options for dropdowns dynamically
  const uniqueBlogForOptions = useMemo(
    () => Array.from(new Set(postsData.map((post) => post.blogfor).filter(Boolean))),
    [postsData]
  );

  const uniqueCategoryOptions = useMemo(() => {
    const allCategories = postsData.flatMap((item) =>
      Array.isArray(item.categoryname) ? item.categoryname : [item.categoryname]
    );
    return Array.from(new Set(allCategories.filter(Boolean)));
  }, [postsData]);

  // Handle post deletion (Soft delete by setting status to "deleted")
  const handleDelete = async (postId) => {
    const stringifiedId = String(postId);
    const postRef = doc(fireDb, "blogPost", stringifiedId);

    const result = await Swal.fire({
      title: "Delete Post?",
      text: "This action will archive the post.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
      customClass: { confirmButton: "rounded-md", cancelButton: "rounded-md" },
    });

    if (result.isConfirmed) {
      try {
        await updateDoc(postRef, { blog_state: "deleted" });
        setPostsData((prev) => prev.filter((post) => String(post.id) !== stringifiedId));
        Swal.fire("Deleted!", "The post has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting post:", error);
        Swal.fire("Error", "There was an issue deleting the post.", "error");
      }
    }
  };

  // Handle post state publishing
  const handlePublish = async (postId) => {
    const stringifiedId = String(postId);
    const postRef = doc(fireDb, "blogPost", stringifiedId);

    const result = await Swal.fire({
      title: "Publish Post?",
      text: "Make this post live on the platform.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Publish Now",
      confirmButtonColor: "#2563eb",
      cancelButtonText: "Cancel",
      customClass: { confirmButton: "rounded-md", cancelButton: "rounded-md" },
    });

    if (result.isConfirmed) {
      try {
        await updateDoc(postRef, { blog_state: "active" });
        setPostsData((prev) =>
          prev.map((post) =>
            String(post.id) === stringifiedId ? { ...post, blog_state: "active" } : post
          )
        );
        Swal.fire("Published!", "The post is now live.", "success");
      } catch (error) {
        console.error("Error publishing post:", error);
        Swal.fire("Error", "Failed to publish the post.", "error");
      }
    }
  };

  // Filter posts based on selected BlogFor and Category
  const filteredPosts = useMemo(() => {
    const normCategory = selectedCategory.trim().toLowerCase();

    return postsData.filter((post) => {
      const categories = Array.isArray(post.categoryname)
        ? post.categoryname.map((c) => String(c).toLowerCase())
        : [String(post.categoryname || "").toLowerCase()];

      const isCategoryMatch = !normCategory || categories.includes(normCategory);
      const isBlogForMatch = !selectedBlogFor || post.blogfor === selectedBlogFor;

      return isCategoryMatch && isBlogForMatch;
    });
  }, [postsData, selectedBlogFor, selectedCategory]);

  // Paginate filtered results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4 w-1/4">Title</th>
              <th className="px-6 py-4 w-1/4">Description</th>
              <th className="px-4 py-4 w-36">
                <select
                  className="w-full bg-white border border-gray-200 text-gray-700 text-xs rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedBlogFor}
                  onChange={(e) => setSelectedBlogFor(e.target.value)}
                >
                  <option value="">All Platforms</option>
                  {uniqueBlogForOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-4 py-4 w-40">
                <select
                  className="w-full bg-white border border-gray-200 text-gray-700 text-xs rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {uniqueCategoryOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-6 py-4">Status & Date</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {paginatedPosts.length > 0 ? (
              paginatedPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Title */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <p className="line-clamp-2" title={post.title}>
                      {post.title}
                    </p>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 text-gray-500">
                    <p className="line-clamp-2 text-xs">
                      {post.description || "No description available."}
                    </p>
                  </td>

                  {/* Target Platform */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {post.blogfor || "General"}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4 text-xs text-gray-600">
                    {Array.isArray(post.categoryname)
                      ? post.categoryname.join(", ")
                      : post.categoryname || "—"}
                  </td>

                  {/* Date & Status */}
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span>{post.date || "N/A"}</span>
                      {post.blog_state === "active" ? (
                        <span className="w-max px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Published
                        </span>
                      ) : (
                        <span className="w-max px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          In Progress
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/Admin/Posts/${post.id}`}
                        title="View Post"
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Link>

                      <Link
                        to={`/Admin/Posts/UpdatePost/${post.id}`}
                        title="Edit Post"
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </Link>

                      {post?.blog_state === "in-progress" && (
                        <button
                          onClick={() => handlePublish(post.id)}
                          title="Publish Post"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faUpload} />
                        </button>
                      )}

                      {post?.blog_state === "active" && (
                        <span title="Published" className="p-1.5 text-emerald-600">
                          <FontAwesomeIcon icon={faCircleCheck} />
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(post.id)}
                        title="Delete Post"
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-400">
                  No matching posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [postsData, setPostsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState("newest");
  const navigate = useNavigate();

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const qActive = query(
          collection(fireDb, "blogPost"),
          where("blog_state", "==", "active"),
          orderBy("createdAt", "desc")
        );
        const qInProgress = query(
          collection(fireDb, "blogPost"),
          where("blog_state", "==", "in-progress"),
          orderBy("createdAt", "desc")
        );

        const [snapActive, snapInProgress] = await Promise.all([
          getDocs(qActive),
          getDocs(qInProgress),
        ]);

        const activePosts = snapActive.docs.map((d) => ({ id: d.id, ...d.data() }));
        const inProgressPosts = snapInProgress.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setPostsData([...inProgressPosts, ...activePosts]);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter & Sort Logic
  const processedPosts = useMemo(() => {
    let result = postsData.filter((post) =>
      post?.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    return result.sort((a, b) => {
      if (selectedSort === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (selectedSort === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (selectedSort === "likes") {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (selectedSort === "comments") {
        return (b.comment_count || 0) - (a.comment_count || 0);
      }
      return 0;
    });
  }, [postsData, searchQuery, selectedSort]);

  const totalPages = Math.ceil(processedPosts.length / itemsPerPage) || 1;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <h1 className="text-xl font-bold text-gray-900">Posts Directory</h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-3 text-gray-400 text-xs"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faFilter} className="text-indigo-500 mr-2 text-xs" />
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-gray-700 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="likes">Most Liked</option>
                    <option value="comments">Most Commented</option>
                  </select>
                </div>

                {/* Add Post Button */}
                <Link
                  to="/Admin/Post/New"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FontAwesomeIcon icon={faPlus} /> Add Post
                </Link>
              </div>
            </div>

            {/* Table Component */}
            <PostsData
              postsData={processedPosts}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              setPostsData={setPostsData}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <span className="text-xs text-gray-500">
                  Showing page <strong className="text-gray-800">{currentPage}</strong> of{" "}
                  <strong className="text-gray-800">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="mr-1" /> Previous
                  </button>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default Posts;