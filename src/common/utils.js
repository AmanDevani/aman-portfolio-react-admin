import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  startAt,
  endAt,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { REGEX } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const formValidatorRules = {
  required: {
    required: true,
    message: 'Required',
  },
  email: () => ({
    validator(rule, value) {
      if (!value) {
        return Promise?.resolve();
      }
      if (!REGEX?.EMAIL?.test(value)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise?.reject('The input is not valid E-mail!');
      }
      return Promise?.resolve();
    },
  }),
  name: () => ({
    validator(rule, value) {
      if (!value) {
        return Promise?.resolve();
      }
      if (!REGEX?.NAME?.test(value)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise?.reject('Please enter valid name');
      }
      return Promise?.resolve();
    },
  }),
  number: () => ({
    validator(rule, value) {
      if (!value) {
        return Promise?.resolve();
      }
      if (!Number(value) || !REGEX?.NUMBER?.test(Number(value))) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise?.reject('Should be a valid Number');
      }
      return Promise?.resolve();
    },
  }),
};

export const handleProtectedNavigation = (allow, callback, path) =>
  allow ? callback(path) : false;

export const createUserEmailPass = async (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithEmail = async (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => auth.signOut();

// sendPasswordResetEmail takes 3rd parameter that takes object { url :''} which used default firebase reset password page, after successful of change password there is one button with the mentioned url that will redirect back to that url. if you don't pass the url then there is no button with the url & only messgae that password reset successfully.
export const forgotPassword = (email) => sendPasswordResetEmail(auth, email);

export const resetPassword = (oobCode, newPassword) =>
  confirmPasswordReset(auth, oobCode, newPassword);

export const setDocTOFireStore = (DB_NAME, uid, schemaToFireStore) =>
  setDoc(doc(db, DB_NAME, uid), schemaToFireStore);

export const getDocFromStore = (DB_NAME, uid) => doc(db, DB_NAME, uid);

export const deleteDocument = async (DB_NAME, uid) => {
  const docRef = doc(db, DB_NAME, uid);
  await deleteDoc(docRef);
};

export const updateRecord = async (DB_NAME, id, data) => {
  const docRef = doc(db, DB_NAME, id); // Reference to the document
  await updateDoc(docRef, data);
};

export const getAllDocsFromStore = async (DB_NAME, options = {}) => {
  const { filters = [], order = [], pagination = {}, search = {} } = options;

  // Reference to the Firestore collection
  let queryRef = collection(db, DB_NAME);

  // Apply additional filters
  filters.forEach(({ field, operator, value }) => {
    queryRef = query(queryRef, where(field, operator, value));
  });

  // Apply sorting
  order.forEach(({ field, direction }) => {
    queryRef = query(queryRef, orderBy(field, direction));
  });

  // Apply search filters if provided
  if (search?.field && search?.value) {
    // Ensure the search field is included in the order array
    const isSearchFieldOrdered = order?.some(
      (orderItem) => orderItem?.field === search?.field,
    );

    // Apply orderBy if not already ordered
    if (!isSearchFieldOrdered) {
      queryRef = query(queryRef, orderBy(search?.field));
    }

    // Apply range search (startAt and endAt) for string search
    queryRef = query(
      queryRef,
      startAt(search?.value),
      endAt(`${search?.value}\uf8ff`), // To handle fuzzy search for strings
    );
  }

  // Create a separate query for counting, without pagination
  const countQueryRef = queryRef;

  // Apply pagination to the main query for fetching data
  if (pagination?.pageSize) {
    queryRef = query(queryRef, limit(pagination?.pageSize));
  }
  if (pagination?.lastVisible) {
    queryRef = query(queryRef, startAfter(pagination?.lastVisible));
  }

  // Fetch documents
  const querySnapshot = await getDocs(queryRef);

  // Get total count after applying filters and search (no pagination applied here)
  const dataFromServer = await getCountFromServer(countQueryRef);
  const totalCount = dataFromServer.data().count || 0;

  // Determine last visible document (for pagination)
  const lastVisible =
    querySnapshot?.docs?.length > 0
      ? querySnapshot.docs[querySnapshot.docs.length - 1]
      : null;

  // Map data
  const data = querySnapshot.docs.map((singleDoc) => ({
    id: singleDoc.id,
    ...singleDoc.data(),
  }));

  return { data, totalCount, lastVisible };
};
