const elementToRemove = document.getElementById("desktop_view");
if (
  elementToRemove &&
  window.getComputedStyle(elementToRemove).display === "none"
) {
  elementToRemove.remove();
}

const API_URL = "https://app.stuntai.co";
const firebaseConfig = {
  apiKey: "AIzaSyBqppbxocgeGDJ5FW6-DmRr0sYVlJvT9c0",
  authDomain: "stuntai-74414.firebaseapp.com",
  projectId: "stuntai-74414",
  storageBucket: "stuntai-74414.appspot.com",
  messagingSenderId: "681956079822",
  appId: "1:681956079822:web:26420a8a88355cdbb8f89f",
};
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);
let myGlobalUser;

let signUpForm = document.getElementById("wf-form-signup-form");
let signInForm = document.getElementById("wf-form-signin-form");
let signOutButton = document.getElementById("signout-button");
let signInButton = document.getElementById("sign-in-button");
let signUpButton = document.getElementById("sign-up-button");

if (signUpButton) {
  signUpButton.addEventListener("click", handleSignUp, true);
}

if (signInButton) {
  signInButton.addEventListener("click", handleSignIn, true);
}

if (signOutButton) {
  signOutButton.addEventListener("click", handleSignOut);
}

function getUserIdToken() {
  return myGlobalUser.getIdToken().then((idToken) => {
    return idToken;
  });
}

function handleSignUp(e) {
  e.preventDefault();
  e.stopPropagation();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const user_name = document.getElementById("sign-up-name").value;

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User successfully created: " + user.email);

      // Send email verification
      user
        .sendEmailVerification()
        .then(function () {
          // Email sent.
          console.log("Email verification sent to: " + user.email);
        })
        .catch(function (error) {
          // An error happened.
          console.error("Error sending email verification:", error);
        });

      return user.updateProfile({
        displayName: user_name,
      });
    })
    .then(() => {
      console.log("User name updated successfully!");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
      errorText.innerHTML = errorMessage;
    });
}

async function handleRedirect(user) {
  if (!user.emailVerified) {
    console.log("Email not verified");
    window.location.href = "email-sent";
    return;
  }
  const id_token = await user.getIdToken();
  fetch(`${API_URL}/api/v1/is_user_enrolled/${id_token}`).then((response) => {
    if ([200, 207].includes(response.status)) {
      window.location.href = "portal/my-dashboard";
      return;
    }
    window.location.href = "pricing";
    return;
  });
}

function handleSignIn(e) {
  e.preventDefault();
  e.stopPropagation();

  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      handleRedirect(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      var errorText = document.getElementById("signin-error-message");
      console.log(errorMessage);
      errorText.innerHTML = errorMessage;
    });
}

function handleSignOut() {
  auth
    .signOut()
    .then(() => {
      console.log("user signed out");
    })
    .catch((error) => {
      const errorMessage = error.message;
      console.log(errorMessage);
    });
}

function handleStripeHref() {
  if (
    window.location.pathname === "/pricing" ||
    window.location.pathname === "/pricing/"
  ) {
    document
      .querySelectorAll(
        "#w-tabs-0-data-w-pane-0 > div > div > a, #w-tabs-0-data-w-pane-1 > div > div > a"
      )
      .forEach((element) => {
        if (element.href.includes("https://buy.stripe.com/")) {
          element.href += `?prefilled_email=${encodeURIComponent(
            window.user.email
          )}&client_reference_id=${encodeURIComponent(window.user.uid)}`;
        }
      });
  }

  if (window.location.href.includes("manage-your-account")) {
    document.querySelector(
      "#change_plan"
    ).href += `?prefilled_email=${encodeURIComponent(window.user.email)}`;
  }
}

auth.onAuthStateChanged(async (user) => {
  let publicElements = document.querySelectorAll("[data-onlogin='hide']");
  let privateElements = document.querySelectorAll("[data-onlogin='show']");

  myGlobalUser = user;
  window.user = user;

  if (user) {
    updateUserElement("#userName", user.displayName);
    updateUserElement("#userNameEdit", user.displayName);
    updateUserElement("#userMail", user.email);

    handleStripeHref();
    if (window.location.href.includes("manage-your-account")) {
      await myPlans(user);
    }

    if (window.location.href.includes("portal")) {
      const user_token = await myGlobalUser.getIdToken();

      // Fetch data from the API
      const is_blurred = await fetch(
        `${API_URL}/api/v1/is_user_enrolled/${user_token}`
      );
      if (is_blurred.status === 207) {
        document.querySelector("#blur").style.display = "block";
      }
    }
    if (
      (window.location.href.includes("my-dashboard") ||
        window.location.href.includes("manage-your-account")) &&
      myGlobalUser != null
    ) {
      fetchDataAndCreateChart();
      fillRecents();
    }
  }

  if (
    (window.location.pathname.includes("/portal/documents") ||
      window.location.pathname.includes("portal/my-dashboard")) &&
    user
  ) {
    window.fetchData(user);
  }

  const dashboard = "/portal/my-dashboard";
  const signIn = "/sign-in-copy";

  console.log(
    "isSignInPage: ",
    window.location.href.indexOf("sign-in") > -1,
    " user: " + user
  );

  if (
    (window.location.href.indexOf("sign-in") > -1 ||
      window.location.href.indexOf("sign-up") > -1) &&
    user
  ) {
    handleRedirect(user);
  } else if (window.location.href.includes("portal/") && !user) {
    window.location.href = signIn;
  }
});

function updateUserElement(elementId, value) {
  if (document.querySelector(elementId) && value) {
    document.querySelectorAll(elementId).forEach((element) => {
      if (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT"
      ) {
        element.value = value;
        if (elementId === "#userMail") {
          element.setAttribute("readonly", "");
        }
      } else {
        element.innerHTML = value;
      }
    });
  }
}

async function sendMessage(rewritePrompt = "", myUuid = "", isNew = true) {
  const myOutputLanguage =
    document.getElementById("language").options[
      document.getElementById("language").selectedIndex
    ].textContent;

  const myProductName = document.getElementById("product_name")
    ? document.getElementById("product_name").value
    : null;
  const myTargetAudience = document.getElementById("target_audience")
    ? document.getElementById("target_audience").value
    : null;
  const myHighlights = document.getElementById("highlights")
    ? document.getElementById("highlights").value
    : null;
  const myToneofSpeaking = document.getElementById("tone_of_speaking")
    ? document.getElementById("tone_of_speaking").value
    : null;
  const myCampaignTarget = document.getElementById("campaing_target")
    ? document.getElementById("campaing_target").value
    : null;
  const my_recipient_name = document.getElementById("recipient_name")
    ? document.getElementById("recipient_name").value
    : null;
  const my_company_name = document.getElementById("company_name")
    ? document.getElementById("company_name").value
    : null;
  const my_recipient_team = document.getElementById("recipient_team")
    ? document.getElementById("recipient_team").value
    : "";
  const my_contact_source = document.getElementById("contact_source")
    ? document.getElementById("contact_source").value
    : null;
  const my_sender_company = document.getElementById("sender_company")
    ? document.getElementById("sender_company").value
    : null;
  const my_sender_company_desc = document.getElementById("sender_company_desc")
    ? document.getElementById("sender_company_desc").value
    : null;
  const my_sender_promoted_product = document.getElementById(
    "sender_promoted_product"
  )
    ? document.getElementById("sender_promoted_product").value
    : null;
  const my_product_desc = document.getElementById("product_desc")
    ? document.getElementById("product_desc").value
    : null;
  const my_available_calendar = document.getElementById("available_calendar")
    ? document.getElementById("available_calendar").value
    : null;
  const my_potential_pain_recipient = document.getElementById(
    "potential_pain_recipient"
  )
    ? document.getElementById("potential_pain_recipient").value
    : null;
  const my_sender_product_name = document.getElementById("sender_product_name")
    ? document.getElementById("sender_product_name").value
    : null;
  const my_sender_product_feat = document.getElementById("sender_product_feat")
    ? document.getElementById("sender_product_feat").value
    : null;
  const my_recipient_company_name = document.getElementById(
    "recipient_company_name"
  )
    ? document.getElementById("recipient_company_name").value
    : null;
  const my_recipient_pain_point = document.getElementById(
    "recipient_pain_point"
  )
    ? document.getElementById("recipient_pain_point").value
    : null;
  const my_recipient_competitor = document.getElementById(
    "recipient_competitor"
  )
    ? document.getElementById("recipient_competitor").value
    : null;
  const my_product_offering = document.getElementById("product_offering")
    ? document.getElementById("product_offering").value
    : null;
  const my_sender_product_performance = document.getElementById(
    "sender_product_performance"
  )
    ? document.getElementById("sender_product_performance").value
    : null;
  const my_product_benefits = document.getElementById("product_benefits")
    ? document.getElementById("product_benefits").value
    : null;
  const my_product_name = document.getElementById("product_name")
    ? document.getElementById("product_name").value
    : null;
  const my_stakeholder_names = document.getElementById("stakeholder_names")
    ? document.getElementById("stakeholder_names").value
    : null;
  const my_short_description = document.getElementById("short_description")
    ? document.getElementById("short_description").value
    : null;
  const my_contributors = document.getElementById("contributors")
    ? document.getElementById("contributors").value
    : null;
  const my_call_to_action_links = document.getElementById(
    "call_to_action_links"
  )
    ? document.getElementById("call_to_action_links").value
    : null;
  const my_event_name = document.getElementById("event_name")
    ? document.getElementById("event_name").value
    : null;
  const my_event_time = document.getElementById("event_time")
    ? document.getElementById("event_time").value
    : null;
  const my_event_place = document.getElementById("event_place")
    ? document.getElementById("event_place").value
    : null;
  const my_event_type = document.getElementById("event_type")
    ? document.getElementById("event_type").value
    : null;
  const my_position_of_hire = document.getElementById("position_of_hire")
    ? document.getElementById("position_of_hire").value
    : null;
  const my_name_of_hire = document.getElementById("name_of_hire")
    ? document.getElementById("name_of_hire").value
    : null;
  const my_hire_background_info = document.getElementById(
    "hire_background_info"
  )
    ? document.getElementById("hire_background_info").value
    : null;
  const my_brief_desc = document.getElementById("brief_desc")
    ? document.getElementById("brief_desc").value
    : null;
  const my_company_website = document.getElementById("company_website")
    ? document.getElementById("company_website").value
    : null;
  const my_company_industry = document.getElementById("company_industry")
    ? document.getElementById("company_industry").value
    : null;
  const my_quotes = document.getElementById("quotes")
    ? document.getElementById("quotes").value
    : null;
  const my_contact = document.getElementById("contact")
    ? document.getElementById("contact").value
    : null;

  const element = document.querySelector(".text-516");
  const userToken = await getUserIdToken();
  console.log(userToken);
  const templateName = element.textContent.toLowerCase();

  var response = await fetch(`${API_URL}/api/v1/stream_chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productName: myProductName,
      targetAudience: myTargetAudience,
      highlights: myHighlights,
      toneofSpeaking: myToneofSpeaking,
      outputLanguage: myOutputLanguage,
      campaignTarget: myCampaignTarget,
      templateName: templateName,
      recipient_name: my_recipient_name,
      company_name: my_company_name,
      recipient_team: my_recipient_team,
      contact_source: my_contact_source,
      sender_company: my_sender_company,
      sender_company_desc: my_sender_company_desc,
      sender_promoted_product: my_sender_promoted_product,
      product_desc: my_product_desc,
      available_calendar: my_available_calendar,
      potential_pain_recipient: my_potential_pain_recipient,
      sender_product_name: my_sender_product_name,
      sender_product_feat: my_sender_product_feat,
      recipient_company_name: my_recipient_company_name,
      recipient_pain_point: my_recipient_pain_point,
      recipient_competitor: my_recipient_competitor,
      product_offering: my_product_offering,
      sender_product_performance: my_sender_product_performance,
      product_benefits: my_product_benefits,
      product_name: my_product_name,
      stakeholder_names: my_stakeholder_names,
      short_description: my_short_description,
      contributors: my_contributors,
      call_to_action_links: my_call_to_action_links,
      event_name: my_event_name,
      event_time: my_event_time,
      event_place: my_event_place,
      event_type: my_event_type,
      position_of_hire: my_position_of_hire,
      name_of_hire: my_name_of_hire,
      hire_background_info: my_hire_background_info,
      brief_desc: my_brief_desc,
      company_website: my_company_website,
      company_industry: my_company_industry,
      quotes: my_quotes,
      contact: my_contact,
      rewritePrompt: rewritePrompt,
      UUID: myUuid,
      userToken: userToken,
    }),
  });

  var reader = response.body.getReader();
  var decoder = new TextDecoder("utf-8");
  let endToken = " ---END--- ";
  window.uids = [];
  isNewFlag = true;

  
  reader.read().then(function processResult(result) {
    if (result.done) return;
    let baseOutput = document.getElementById("output_0");
    baseOutput.style.display = "block";

    let token = decoder.decode(result.value);

    if (!isNew && isNewFlag) {
      let newOutput = deepCopyResponseDiv(baseOutput);
      newOutput.style.display = "block";
      baseOutput.parentNode.insertBefore(newOutput, baseOutput);
      isNewFlag = false;
    }

    if (token.includes(endToken)) {
      const partsWithUuid = token.match(
        /(.*?)\s*---END---\s*([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\s*(.*)/
      );

      if (partsWithUuid) {
        token = partsWithUuid[1];
        window.uids.push(partsWithUuid[2]);
        token_left = partsWithUuid[3];
      }
      
      if (isNew) {
        let newOutput = deepCopyResponseDiv(baseOutput);
        newOutput.style.display = "block";
        baseOutput.parentNode.appendChild(newOutput);
        newOutput.querySelector(`#myOutputText_${uids.length}`).innerHTML = token_left ? token_left : "";
      }
    }

    document
      .querySelector(`#output_${uids.length}`)
      .querySelector(`#myOutputText_${uids.length}`).innerHTML += token + "";

    endTokenReached = false;

    return reader.read().then(processResult);
  });
}

function deepCopyResponseDiv(baseOutput) {
  let newOutput = baseOutput.cloneNode(true);
  newOutput.id = `output_${uids.length}`;

  newOutput.querySelector("#myOutputText_0").id = `myOutputText_${uids.length}`;
  newOutput.querySelector("#copy0").id = `copy${uids.length}`;
  newOutput.querySelector("#thumbs-up0").id = `thumbs-up${uids.length}`;
  newOutput.querySelector("#thumbs-down0").id = `thumbs-down${uids.length}`;

  return newOutput;
}

function hasMatchingIdOrParentWithId(text, element) {
  while (element && element !== document) {
    if (new RegExp(`^${text}\\d+$`).test(element.id)) {
      return element;
    }
    element = element.parentNode;
  }
  return null;
}

function hasMatchingIdOrParent(text, element) {
  while (element && element !== document) {
    if (new RegExp(`^${text}`).test(element.id)) {
      return element;
    }
    element = element.parentNode;
  }
  return null;
}

const parentElement = document.body;

parentElement.addEventListener("click", function (event) {
  const submitButton = event.target.id === "submit_button";
  if (submitButton) {
    console.log("Submit button clicked!");
    sendMessage();
  }

  const matchedElement = hasMatchingIdOrParentWithId("copy", event.target);

  if (matchedElement) {
    const num = parseInt(matchedElement.id.match(/\d+/)[0]);
    const sourceId = "myOutputText_" + num;
    const sourceElement = document.getElementById(sourceId);

    if (sourceElement) {
      console.log(`Copying text from ${sourceId}`);
      var textToCopy = sourceElement.innerText;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            window.showToast("Copied to clipboard");
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
          });
      } else {
        var textarea = document.createElement("textarea");
        textarea.textContent = textToCopy;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          alert("Copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy: ", err);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    }
  }

  const matchedElement2 = hasMatchingIdOrParentWithId(
    "thumbs-up",
    event.target
  );

  if (matchedElement2) {
    const num = matchedElement2.id.match(/\d+$/)[0];
    const uid = window.uids[num];

    const apiUrl = `${API_URL}/api/v1/like/uuid=${uid}&isliked=1`;

    window.showToast("Liked!");

    fetch(apiUrl, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  const matchedElement3 = hasMatchingIdOrParentWithId(
    "thumbs-down",
    event.target
  );

  if (matchedElement3) {
    const num = matchedElement3.id.match(/\d+$/)[0];
    const uid = window.uids[num];

    const apiUrl = `${API_URL}/api/v1/like/uuid=${uid}&isliked=0`;

    window.showToast("Disliked!");

    fetch(apiUrl, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  const matchedElement4 = hasMatchingIdOrParent("rewriteButton", event.target);

  if (matchedElement4) {
    sendMessage(
      (rewritePrompt = document.querySelector("#rewriteText").value),
      (myUuid = window.uids[0]),
      (isNew = false)
    );
  }

  const matchedElement5 = hasMatchingIdOrParent("google", event.target);

  if (matchedElement5) {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
    firebase
      .auth()
      .getRedirectResult()
      .then((result) => {
        if (result.credential) {
          /** @type {firebase.auth.OAuthCredential} */
          var credential = result.credential;

          var token = credential.accessToken;
        }
        var user = result.user;
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
      });
  }

  const matchedElement6 = hasMatchingIdOrParent("editInfoButton", event.target);

  if (matchedElement6) {
    const user_name = document.querySelector("#userNameEdit").value;
    const newPass = document.querySelector("#userPassword").value;
    const newPass2 = document.querySelector("#userPassword2").value;

    if (newPass.length > 0) {
      if (newPass !== newPass2) {
        window.showToast("Passwords do not match");
        return;
      } else if (newPass.length < 8) {
        window.showToast("Password must be at least 8 characters long");
        return;
      } else {
        window.user
          .updatePassword(newPass)
          .then(() => {})
          .catch((error) => {
            window.showToast(`Password isn't updated: ${error.message}`);
            return;
          });
      }
    }

    return window.user
      .updateProfile({
        displayName: user_name,
      })
      .then(() => {
        window.showToast("User name updated successfully!");
      })
      .catch((error) => {
        window.showToast(errorMessage);
      });
  }
});

window.fetchData = async function (user) {
  const token = await user.getIdToken();
  const apiResponse = await fetch(`${API_URL}/api/v1/recents/${token}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response = await apiResponse.json();
  console.log(response);

  response.forEach((item, index) => {
    document.querySelector(`#row${index + 1}`).style.display = "flex";
    if (
      item["log_query_fields"] !== null &&
      item["log_query_fields"].length > 0
    ) {
      document.querySelector(`#row${index + 1} #name`).innerHTML =
        item["log_query_fields"][0];
      if (document.querySelector(`#row${index + 1} #type`)) {
        document.querySelector(`#row${index + 1} #type`).innerHTML =
          item["log_query_fields"][item["log_query_fields"].length - 1];
      }
      const timestamp = item["log_last_update"];
      const readableTimestamp = `${new Date(timestamp).getDate()} ${new Date(
        timestamp
      ).toLocaleString("en-US", { month: "long" })} ${new Date(
        timestamp
      ).getFullYear()}, ${new Date(timestamp).getHours() % 12 || 12}:${new Date(
        timestamp
      )
        .getMinutes()
        .toString()
        .padStart(2, "0")} ${
        new Date(timestamp).getHours() >= 12 ? "PM" : "AM"
      }`;
      document.querySelector(`#row${index + 1} #modified`).innerHTML =
        readableTimestamp;
    } else {
      document.querySelector(`#row${index + 1} #name`).innerHTML = "No name";
      document.querySelector(`#row${index + 1} #type`).innerHTML = "No type";
      document.querySelector(`#row${index + 1} #modified`).innerHTML =
        "No Date";
    }
  });

  document.addEventListener("click", function (event) {
    let target = event.target;
    while (target && !target.id.includes("row")) {
      target = target.parentElement;
    }
    if (target && target.id.includes("row")) {
      var rowId = target.id.match(/\d+/)[0];
      let queryParams = response[rowId - 1]["log_query_fields"]
        .slice(0, -1)
        .map((value, index) => `param${index}=${encodeURIComponent(value)}`)
        .join("&");
      let outputMatchersParams = response[rowId - 1]["output_matchers"]
        .map(
          (matcher, index) =>
            `output${index}=${encodeURIComponent(matcher["response"])}`
        )
        .join("&");

      if (queryParams.length > 0 && outputMatchersParams.length > 0) {
        queryParams += "&" + outputMatchersParams;
      } else if (outputMatchersParams.length > 0) {
        queryParams = outputMatchersParams;
      }

      window.location.href = `${
        response[rowId - 1]["template"]
      }?${queryParams}`;
    }
  });
};
function fillInputFieldsFromUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramsArray = [];
  const outputsArray = [];

  urlParams.forEach((value, key) => {
    if (key.includes("param")) {
      paramsArray.push(value);
    }
  });
  urlParams.forEach((value, key) => {
    if (key.includes("output")) {
      outputsArray.push(value);
    }
  });

  document.querySelectorAll(".w-input, .w-select").forEach((input, index) => {
    if (index < paramsArray.length) {
      const value = paramsArray[index];
      if (input.type === "text") {
        input.value = value;
      } else if (input.tagName === "SELECT") {
        const optionExists = Array.from(input.options).some(
          (option) => option.value === value
        );
        if (!optionExists) {
          const option = document.createElement("option");
          option.value = value;
          option.text = value;
          input.appendChild(option);
        }
        input.value = value;
      }
    }
  });

  outputsArray.forEach((output, index) => {
    document.querySelector(`#output_${index}`).style.display = "block";
    document.querySelector(`#myOutputText_${index}`).innerHTML = output;
  });
}

const urlParams = new URLSearchParams(window.location.search);
if (Array.from(urlParams.entries()).length > 0) {
  fillInputFieldsFromUrlParams();
}
const toasts = [];
const offsetIncrement = 40;

window.showToast = function (text) {
  const originalToast = document.querySelector("#toaster");
  const toastClone = originalToast.cloneNode(true);
  toastClone.querySelector("p").textContent = text;
  toastClone.style.display = "block";
  toastClone.removeAttribute("id");

  const topPosition = toasts.length * offsetIncrement;
  toastClone.style.top = `${topPosition}px`;
  document.body.appendChild(toastClone);
  toasts.push(toastClone);

  setTimeout(() => {
    toastClone.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toastClone);
      toasts.splice(toasts.indexOf(toastClone), 1);

      toasts.forEach((toast, index) => {
        toast.style.top = `${index * offsetIncrement}px`;
      });
    }, 500);
  }, 3000);
};

async function fetchDataAndCreateChart() {
  // Obtain the ID token
  const user_token = await myGlobalUser.getIdToken();

  // Fetch data from the API
  const is_blurred = await fetch(
    `${API_URL}/api/v1/is_user_enrolled/${user_token}`
  );
  if (is_blurred.status === 207) {
    return;
  }

  const response = await fetch(`${API_URL}/api/v1/usage/daily/${user_token}`);
  const apiData = await response.json();
  const data = apiData.slice(-5);

  let monthly_hak = 10000;
  const targetDiv = document.getElementById("chart"); // Use your target div's ID

  // I want total sum of all data total_response_length
  const totalWords = apiData.reduce(
    (acc, item) => acc + item.total_response_length,
    0
  );

  const totalWord = document.querySelector("#total_word");
  totalWord.innerHTML += `${totalWords}`;
  totalWord.style.display = "block";

  const usedWord = document.querySelector("#used_word");
  usedWord.innerHTML += `${monthly_hak}`;
  usedWord.style.display = "block";

  const labels = data.map((item) => convertDate(item.last_update_day));
  const values = data.map((item) => item.total_response_length);

  // Create canvas element
  const canvas = document.createElement("canvas");
  canvas.id = "myChart";
  canvas.width = 400;
  canvas.height = 400;

  // Append canvas to a specific div
  targetDiv.appendChild(canvas);

  // Initialize the chart
  const ctx = canvas.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Generated Words",
          data: values,
          backgroundColor: "rgba(234, 237, 250, 20)",
          borderColor: "rgba(234, 237, 250, 20)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function convertDate(dateString) {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const dateParts = dateString.split("-");
  return `${dateParts[2]} ${months[parseInt(dateParts[1], 10) - 1]}`;
}

async function fillRecents() {
  const x = await myGlobalUser.getIdToken();
  const response = await fetch(`${API_URL}/api/v1/favourites/${x}`);

  const apiData = await response.json();

  const elements = apiData.map((item) =>
    document.querySelector(`#${item.template}`)
  );

  elements.forEach((element) => {
    element.style.display = "inline-block";
  });

  document.querySelector("#recents").replaceChildren(...elements);
}

async function myPlans(user) {
  const idToProductMap = {
    prod_PnCewPGTjnZKkF: "elite_yearly",
    prod_PnCbkIUP3oQHy4: "super_yearly",
    prod_PnCWmjPQpoN6Ft: "big_yearly",
    prod_PnCP6dSDWNrJwL: "professional_yearly",
    prod_PjiftEwvwXYU3B: "limited_yearly",
    prod_PnCcyWcEVruu81: "elite_monthly",
    prod_PnCa0d38Kk9Vyw: "super_monthly",
    prod_PnCVNin7Kj78hN: "big_monthly",
    prod_PnCONrdouMXApU: "professional_monthly",
    prod_PjeUaaUuw7qDtK: "limited_monthly",
  };

  const user_token = await user.getIdToken();

  fetch(`${API_URL}/api/v1/get_user_subscription/${user_token}`).then(
    (response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          const product = idToProductMap[data.plan];
          if (product) {
            document
              .querySelector("#your_plan_account")
              .appendChild(document.querySelector(`#${product}`));
            document.querySelector(`#${product}`).style.display = "block";

            document
              .querySelector("#best_option_for_you")
              .appendChild(document.querySelector("#elite_yearly"));
            document.querySelector("#elite_yearly").style.display = "block";
          }
        });
      }
    }
  );
}

if (window.location.href.includes("email-sent")) {
  document.addEventListener("DOMContentLoaded", function () {
    document
      .getElementById("resend_mail")
      .addEventListener("click", function () {
        // Send email verification when the button is clicked
        user
          .sendEmailVerification()
          .then(function () {
            // Email sent.
            console.log("Email verification sent to: " + user.email);
            // You can also show a success message to the user if needed
          })
          .catch(function (error) {
            // An error happened.
            console.error("Error sending email verification:", error);
            // You can also show an error message to the user if needed
          });
      });
  });
}
