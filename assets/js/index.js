import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDSjin3dOcuJ4ayEESIy5IcRovf1d2mRU",
  authDomain: "tec-id-card.firebaseapp.com",
  projectId: "tec-id-card",
  storageBucket: "tec-id-card.appspot.com",
  messagingSenderId: "832400378679",
  appId: "1:832400378679:web:1c7951c2d6b79e8f8ca8b2",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();
const auth = getAuth();

var alertOnLoad;
var empArr = [];
var tbody = document.getElementById("tbody");
var empCounter = document.getElementById("empCounter");
var profilePic = document.getElementById("profilePic");
var list = document.getElementById("list");
var spinner = document.getElementById("spinner");

window.logoutLinkClick = function () {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
      console.log(error);
    });
};

function getDataFromDatabase() {
  var reference = ref(database, `employees`);
  onChildAdded(reference, function (data) {
    if (data) {
      empArr.push(data.val());
      renderEmployeesList();
    } else {
      alert("data not found");
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    validate(user);
  } else {
    ("user not signed in");
    signIn();
  }
});

function validate(user) {
  if (
    user.uid === "VJAAs6Dn22Z6ji8LoMs1qZiymr82" ||
    user.uid === "ZVjOhIjRdafBOPwxgQCegj2IFJ03"
  ) {
    profilePic.src = user.photoURL;
    // console.log(user.photoURL);
    document.getElementById("mainForm").style.display = "block";
    // console.log("valid user signed in");
    alertOnLoad = Swal.close();
    return true;
  } else {
    Swal.fire({
      title: "ACCESS DENIED",
      text: "Not valid user found!",
      icon: "error",
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonText: "Re-Authenticate with Google",
    }).then((result) => {
      if (result.isConfirmed) {
        signInWithGoogleID();
      }
    });

    console.log("Not valid user found");
    return false;
  }
}

window.signInWithGoogleID = function () {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log(user.uid);
      validate(user);
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};

function signIn() {
  mainForm.style.display = "none";

  alertOnLoad = Swal.fire({
    title: "Sign In with Google",
    text: "Click below button to sign in!",
    icon: "warning",
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    confirmButtonText: "Authenticate with Google",
  }).then((result) => {
    if (result.isConfirmed) {
      signInWithGoogleID();
    }
  });
}

function renderEmployeesList() {
  //   console.log(empArr.length);
  //   console.log(empArr);

  empCounter.innerHTML = empArr.length;

  spinner.style.display = "none";
  list.style.display = "block";

  tbody.innerHTML = "";
  for (var i = 0; i < empArr.length; i++) {
    tbody.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>
              <div class="d-flex align-items-center">
                <img
                  src="${empArr[i].empPicURL}"
                  alt=""
                  style="width: 45px; height: 45px"
                  class="rounded-circle"
                />
                <div class="ms-3">
                  <p class="fw-bold mb-1">${empArr[i].name}</p>
                </div>
              </div>
            </td>
            <td>
              <p class="fw-normal mb-1">${empArr[i].fname}</p>
            </td>
            <td>${empArr[i].designation}</td>
            <td>${empArr[i].cnic}</td>
            <td>
              <span class="badge badge-success rounded-pill d-inline"
                >${empArr[i].expiry}</span
              >
            </td>
            <td>
              <a href="${
                empArr[i].empCardURL
              }"  type="button" class="btn btn-link btn-sm btn-rounded" target="_blank">
                <i class="fa-solid fa-download"></i>
              </a>
            </td>
          </tr>
    `;
  }
}

getDataFromDatabase();
