import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

// Create a function to check if the category exists
const checkCategoryExists = async (categoryName) => {
  const categoryRef = collection(fireDb, 'categories');
  const q = query(categoryRef, where('name', '==', categoryName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty; // If empty, category does not exist
};

// Create a function to add a category if it doesn't exist
const addCategoryIfNotExists = async (categoryName) => {
  const categoryExists = await checkCategoryExists(categoryName);
  
  if (categoryExists) {
    Swal.fire({
      icon: 'warning',
      title: 'Category Exists',
      text: 'This category already exists in the database.',
    });
    return false; // Do not proceed to post submission
  } else {
    try {
      // Add new category to Firestore if it doesn't exist
      await addDoc(collection(fireDb, 'categories'), {
        name: categoryName,
        createdAt: Timestamp.now(),
      });
      console.log('Category added successfully!');
      return true; // Proceed with post creation
    } catch (error) {
      console.error('Error adding category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an error adding the category.',
      });
      return false;
    }
  }
};






// --------------

const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if category exists and add it if necessary
  const categoryAdded = await addCategoryIfNotExists(formData.categoryname);
  if (!categoryAdded) {
    return; // Exit early if category was not added or already exists
  }

  const newPost = {
    title: formData.title,
    page: formData.Page,
    content: editorHtml,
    keywords: formData.keywords,
    coverimages: uploadedImageUrl,
    blogfor: formData.blogfor,
    categoryname: formData.categoryname,
    createdAt: new Date().toISOString(),
  };

  try {
    // Save post in Firestore under blogdb -> blogs collection
    const blogRef = collection(fireDb, 'blogPost'); // Reference to blogs collection under blogdb
    await addDoc(blogRef, {
      ...newPost,
      time: Timestamp.now(),
      postauthor: postauthor,
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
    });

    Swal.fire({
      icon: 'success',
      title: 'Post Created',
      html: `Title: ${formData.title}<br>Page: ${formData.Page}<br>Content: ${editorHtml}<br>Tags: ${formData.tags}<br>Keywords: ${formData.keywords}`,
    });

    // Clear the form
    setFormData({
      title: '',
      Page: '',
      content: '',
      keywords: '',
      coverimages: '',
      blogfor: '',
      categoryname: '',
    });
    // setEditorData('');
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'There was an issue creating the post. Please try again.',
    });
  }
};



// Update the selectedCat state with the category name
const handleCategory = (e) => {
  setSelectedCat(e.target.value); // Update category name input value
  setFormData((prevData) => ({ ...prevData, categoryname: e.target.value }));
};



<div className="flex flex-col pt-4">
  <label htmlFor="categoryname" className="text-lg">Category Name</label>
  <input
    type="text"
    id="categoryname"
    name="categoryname"
    value={selectedCat}
    onChange={handleCategory}  // This should update the selectedCat state
    required
    className="border rounded-lg p-2"
  />
</div>
