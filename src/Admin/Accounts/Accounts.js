import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Loading from '../../layouts/Loading';
import { Timestamp, collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { fireDb } from '../../firebase'; // Ensure fireDb is configured properly

function UserAccountManager({ user, onUpdate, onDelete }) {
  const [updating, setUpdating] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ ...user });
  const handleUpdate = () => {
    Swal.fire({
      title: 'Are you sure you want to update this user?',
      icon: 'warning',
      html: `
        <p><b>Username</b>: ${updatedUser.name}</p>
        <p><b>Email</b>: ${updatedUser.email}</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      preConfirm: () => onUpdate(updatedUser),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Success', 'User details updated successfully!', 'success');
        setUpdating(false);
      }
    });
  };

  const handleClose = () => {
    setUpdating(false);
  };
 

  return (
    <>
      <tr className="shadow-md items-center p-2 mb-2 justify-center gap-9 rounded-lg bg-white text-center">
        <td className="border p-2">{user.name}</td>
        <td className="border p-2">{user.email}</td>
        <td className="border p-2"> {'•••••••••••'}</td>
        <td className="border p-2">{user.created_at}</td>
        <td className="border p-2">
          <FontAwesomeIcon
            onClick={() => setUpdating(true)}
            className="text-indigo-500 hover:cursor-pointer"
            icon={faPen}
          />
        </td>
      </tr>

      {updating && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Update User</h2>
          <input
            type="text"
            placeholder="New Username"
            value={updatedUser.name}
            onChange={(e) => setUpdatedUser({ ...updatedUser, name: e.target.value })}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="New Email"
            value={updatedUser.email}
            onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleUpdate}
          >
            Save
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 ml-3 mb-2 rounded"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}

function Accounts() {


     const [carList, setCarList] = useState([])

  useEffect(() => {
    async function getCars() {
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      fetch("https://api.longdrivecars.com/site/cars-info?location=hyderabad", requestOptions)
        .then((response) => response.json())
        .then((result) => setCarList(result?.data?.results))
        .catch((error) => console.error(error));
    }
    getCars()
  }, [])
  const tataCars = carList.filter(car =>
    !["2024", "2025", 'diesel', 'pe'].some(year => car.maker_model.toLowerCase().includes(year))
  );
  const sortedTataCars = carList.sort((a, b) => {
    return a.maker_model.localeCompare(b.maker_model);
  });

  console.log(sortedTataCars, 'tt');




  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const fetchUsersFromFirestore = async () => {
      try {
        const usersCollectionRef = collection(fireDb, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsersData(usersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users from Firestore:', error);
        setLoading(false);
      }
    };

    fetchUsersFromFirestore();
  }, []);

  const updateUser = async (updatedUser) => {
    try {
      const userDocRef = doc(fireDb, 'users', updatedUser.id);
      await setDoc(userDocRef, updatedUser, { merge: true });

      const updatedUsers = usersData.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      );
      setUsersData(updatedUsers);

      Swal.fire('Success', 'User updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      Swal.fire('Error', 'An error occurred while updating the user. Please try again.', 'error');
    }
  };

  const deleteUser = async (userId) => {
    try {
      const userDocRef = doc(fireDb, 'users', userId);
      await deleteDoc(userDocRef);

      const updatedUsers = usersData.filter((user) => user.id !== userId);
      setUsersData(updatedUsers);

      Swal.fire('Success', 'User deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire('Error', 'An error occurred while deleting the user. Please try again.', 'error');
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      Swal.fire('Error', 'All fields are required', 'error');
      return;
    }

    const timestampPresent = Date.now();
    const salt = Math.random().toString(36).substr(2, 9);

    const newUserObj = {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      created_at: new Date().toLocaleString(),
      time: Timestamp.now(),
      id: `${timestampPresent}-${salt}`,
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
    };

    try {
      const usersCollectionRef = collection(fireDb, 'users');
      await setDoc(doc(usersCollectionRef, newUserObj.id), newUserObj);

      setUsersData([...usersData, newUserObj]);

      setIsModalOpen(false);
      Swal.fire('Success', 'User created successfully!', 'success');
    } catch (error) {
      console.error('Error creating user:', error);
      Swal.fire('Error', 'An error occurred while creating the user. Please try again.', 'error');
    }
  };

  return (
    <AdminLayout>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto mt-8 px-10 bg-white pb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 mb-4"
          >
            <FontAwesomeIcon icon={faPlus} /> Create User
          </button>

          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-2xl font-semibold mb-4">Create New User</h2>
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2 mb-3 border border-gray-300 rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 mb-3 border border-gray-300 rounded"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2 mb-3 border border-gray-300 rounded"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleCreateUser}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg mr-2"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-screen-lg">
            <h1 className="text-3xl font-bold mb-4">User Accounts</h1>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="border p-2">Username</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Password</th>
                  <th className="border p-2">Created</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user) => (
                  <UserAccountManager
                    key={user.id}
                    user={user}
                    onUpdate={updateUser}
                    onDelete={deleteUser}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Serial No</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Car Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {carList?.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{index+1}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}> {item?.maker_model}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>₹{item?.price_24_hours *24}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}

export default Accounts;

