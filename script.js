const elementToRemove = document.getElementById("desktop_view");
window.uids = [];

if (
  elementToRemove &&
  window.getComputedStyle(elementToRemove).display === "none"
) {
  elementToRemove.remove();
}

const API_URL = "https://app.stuntai.co";
const signUpUrl = "/sign-up-copy";
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

let signOutButton = document.getElementById("sign-out-button");
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
  const checkBox = document.querySelector("#checkbox");
  let errorOccurred = false;

  if (!checkBox.checked) {
    window.showToast("Please accept the Privacy Policy and Terms of Service.");
    return;
  }
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
      errorOccurred = true;
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === "auth/email-already-in-use") {
        window.showToast("Email is already in use");
      } else if (errorCode === "auth/weak-password") {
        window.showToast("Your password must be at least 6 characters");
      } else {
        // Handle other errors if needed
        window.showToast("Error");
        console.error(errorMessage);
      }
    })
    .then(() => {
      if (errorOccurred) {
        return;
      }
      window.location.href = "email-sent";
    });
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("reset_button")
    .addEventListener("click", function (e) {
      e.preventDefault();
      var email = document.getElementById("forget_email").value;
      firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(function () {
          document.getElementById("message").innerText =
            "Password reset email sent!";
        })
        .catch(function (error) {
          document.getElementById("message").innerText = error.message;
        });
    });
});

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
      var errorCode = error.code;
      var errorMessage = error.message;

      // Check the error code and display the appropriate message
      if (
        errorCode === "auth/invalid-email" ||
        errorCode === "auth/user-not-found" ||
        errorCode === "auth/wrong-password" ||
        errorCode === "auth/internal-error"
      ) {
        window.showToast("Username or password is incorrect");
      } else {
        // Handle other errors if needed
        console.error(errorMessage);
      }
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

if (window.location.href.includes("pricing")) {
  (async function () {
    await handleStripeHref();
  })();
}

async function handleStripeHref() {
  if (
    window.location.pathname === "/pricing" ||
    window.location.pathname === "/pricing/"
  ) {
    try {
      trial_monthly_urls = [
        `https://buy.stripe.com/3cs5mk9O5bGzbqocN7?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/7sI0201hz6mf2TS14r?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/28oaGE3pH6mf664cNb?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/28odSQf8pdOH1POfZp?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/28odSQf8pdOH1POfZp?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
      ];
      trial_yearly_urls = [
        `https://buy.stripe.com/eVa2a83pH5ibfGE3cF?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/28o6qo5xP8unbqofZt?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/cN29CAgctbGz9ig3cJ?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/dR67us7FXcKD2TS00z?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/dR67us7FXcKD2TS00z?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
      ];
      monthly_urls = [
        `https://buy.stripe.com/6oEaGE0dvfWPamk14q?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/9AQ8ywd0h11VfGE8wU?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/8wM3ec2lDh0TgKIbJ8?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/6oE7usaS9fWPbqo9B2?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/6oE7usaS9fWPbqo9B2?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
      ];
      yearly_urls = [
        `https://buy.stripe.com/dR6eWUbWdcKD5206oS?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/eVadSQgctbGz7a89B6?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/14kcOMbWd5ib2TSeVs?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/14k8yw0dv5ib520bJi?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
        `https://buy.stripe.com/14k8yw0dv5ib520bJi?prefilled_email=${encodeURIComponent(
          window.user.email
        )}&client_reference_id=${encodeURIComponent(window.user.uid)}`,
      ];
    } catch (e) {
      console.error("Error: ", e);
    }

    const buttonIds = ["limited", "professional", "big", "super", "elite"];
    const baseUrl = window.location.origin;

    if (!window.user) {
      console.log("User token is not available");
      buttonIds.forEach((id, index) => {
        document.querySelector(
          `#${id}_y_button`
        ).href = `${baseUrl}${signUpUrl}`;
        document.querySelector(`#${id}_y_button`).innerText = "Get Started";
        document.querySelector(
          `#${id}_m_button`
        ).href = `${baseUrl}${signUpUrl}`;
        document.querySelector(`#${id}_m_button`).innerText = "Get Started";
      });
      return;
    }

    const id_token = await window.user.getIdToken();

    fetch(`${API_URL}/api/v1/is_user_enrolled/${id_token}`).then((response) => {
      if (response.status === 431) {
        buttonIds.forEach((id, index) => {
          document.querySelector(`#${id}_y_button`).href =
            trial_yearly_urls[index];
          document.querySelector(`#${id}_y_button`).innerText =
            "Start free trial";
          document.querySelector(`#${id}_m_button`).href =
            trial_monthly_urls[index];
          document.querySelector(`#${id}_m_button`).innerText =
            "Start free trial";
        });
      } else {
        buttonIds.forEach((id, index) => {
          document.querySelector(`#${id}_y_button`).href = yearly_urls[index];
          document.querySelector(`#${id}_y_button`).innerText = "Subscribe now";
          document.querySelector(`#${id}_m_button`).href = monthly_urls[index];
          document.querySelector(`#${id}_m_button`).innerText = "Subscribe now";
        });
      }
    });
  } else if (window.location.href.includes("manage-your-account")) {
    document.querySelector(
      "#change_plan"
    ).href += `?prefilled_email=${encodeURIComponent(window.user.email)}`;
  }
}

auth.onAuthStateChanged(async (user) => {
  myGlobalUser = user;
  window.user = user;

  if (user) {
    updateUserElement("#userName", user.displayName);
    updateUserElement("#userNameEdit", user.displayName);
    updateUserElement("#userMail", user.email);

    await handleStripeHref();
    if (window.location.href.includes("manage-your-account")) {
      await myPlans(user);
    }

    if (window.location.href.includes("portal")) {
      const user_token = await myGlobalUser.getIdToken();

      const urlParams = new URLSearchParams(window.location.search);
      if (Array.from(urlParams.entries()).length > 0) {
        await fillInputFieldsFromUrlParams();
      }

      // Fetch data from the API
      const is_blurred = await fetch(
        `${API_URL}/api/v1/is_user_enrolled/${user_token}`
      );
      if (is_blurred.status === 207) {
        document.querySelector("#blur").style.display = "block";
      }
      else if (is_blurred.status === 431) {
        document.querySelector("#signup-popup").style.display = "flex";
      }

    }
    if (
      (window.location.href.includes("my-dashboard") ||
        window.location.href.includes("manage-your-account")) &&
      myGlobalUser != null
    ) {
      fetchDataAndCreateChart();
      //fillRecents();
    }
  }

  if (
    (window.location.pathname.includes("/portal/documents") ||
      window.location.pathname.includes("portal/my-dashboard")) &&
    user
  ) {
    window.fetchData(user);
  }

  const signIn = "/sign-in-today";

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

  document.querySelector("#output_lottie").style.display = "block";

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
  const my_sender_name = document.getElementById("sender_name")
    ? document.getElementById("sender_name").value
    : null;
  const my_client_name = document.getElementById("client_name")
    ? document.getElementById("client_name").value
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
      product_name: myProductName,
      target_audience: myTargetAudience,
      highlights: myHighlights,
      tone_of_speaking: myToneofSpeaking,
      language: myOutputLanguage,
      campaing_target: myCampaignTarget,
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
      sender_name: my_sender_name,
      client_name: my_client_name,
      rewritePrompt: rewritePrompt,
      UUID: myUuid,
      userToken: userToken,
    }),
  });

  var reader = response.body.getReader();
  var decoder = new TextDecoder("utf-8");
  let endToken = " ---END--- ";
  isNewFlag = true;

  reader.read().then(function processResult(result) {
    document.querySelector("#output_lottie").style.display = "none";
    if (result.done) return;
    let baseOutput = document.getElementById("output_0");
    baseOutput.style.display = "block";

    let token = decoder.decode(result.value).replace(/\n/g, "<br>");

    if (!isNew && isNewFlag) {
      let newOutput = deepCopyResponseDiv(baseOutput);
      newOutput.style.display = "block";
      baseOutput.parentNode.appendChild(newOutput);
      isNewFlag = false;
    }

    if (token.includes(endToken)) {
      const partsWithUuid = token.match(
        /([\s\S]*)\s*---END---\s*([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\s*(.*)/
      );

      if (partsWithUuid) {
        token = partsWithUuid[1];

        try {
          document
            .querySelector(`#output_${window.uids.length}`)
            .querySelector(`#myOutputText_${window.uids.length}`).innerHTML +=
            token + "";
        } catch (e) {
          let newOutput = deepCopyResponseDiv(baseOutput);
          newOutput.style.display = "block";
          baseOutput.parentNode.appendChild(newOutput);
          document
            .querySelector(`#output_${window.uids.length}`)
            .querySelector(`#myOutputText_${window.uids.length}`).innerHTML +=
            token + "";
        }

        window.uids.push(partsWithUuid[2]);
        token_left = partsWithUuid[3];
        console.log(partsWithUuid);
      }

      if (token_left.length > 0) {
        let newOutput = deepCopyResponseDiv(baseOutput);
        newOutput.style.display = "block";
        baseOutput.parentNode.appendChild(newOutput);
        newOutput.querySelector(
          `#myOutputText_${window.uids.length}`
        ).innerHTML = token_left ? token_left : "";
      }
    } else {
      try {
        document
          .querySelector(`#output_${window.uids.length}`)
          .querySelector(`#myOutputText_${window.uids.length}`).innerHTML +=
          token + "";
      } catch (e) {
        let newOutput = deepCopyResponseDiv(baseOutput);
        newOutput.style.display = "block";
        baseOutput.parentNode.appendChild(newOutput);
        document
          .querySelector(`#output_${window.uids.length}`)
          .querySelector(`#myOutputText_${window.uids.length}`).innerHTML +=
          token + "";
      }
    }
    document
      .querySelector("#output_lottie")
      .parentNode.prepend(document.querySelector("#output_lottie"));

    return reader.read().then(processResult);
  });
}

function removeEmptyOutputs() {
  let i = 0;
  while (document.querySelector(`#myOutputText_${i}`) !== null) {
    textBoxText = document.querySelector(`#myOutputText_${i}`);
    if (!textBoxText.textContent.trim()) {
      document.querySelector(`#output_${i}`).remove();
    }
    i++;
  }
}

function deepCopyResponseDiv(baseOutput) {
  let newOutput = baseOutput.cloneNode(true);
  newOutput.id = `output_${window.uids.length}`;

  newOutput.querySelector("#myOutputText_0").innerHTML = "";
  newOutput.querySelector("#variantNo").innerText = `Variant - ${
    window.uids.length + 1
  }`;

  newOutput.querySelector(
    "#myOutputText_0"
  ).id = `myOutputText_${window.uids.length}`;
  newOutput.querySelector("#copy0").id = `copy${window.uids.length}`;
  newOutput.querySelector("#thumbs-up0").id = `thumbs-up${window.uids.length}`;
  newOutput.querySelector(
    "#thumbs-down0"
  ).id = `thumbs-down${window.uids.length}`;

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
    if (window.uids.length > 0) {
      sendMessage(
        (rewritePrompt = ""),
        (myUuid = window.uids[0]),
        (isNew = false)
      );
    } else {
      sendMessage();
    } //removeEmptyOutputs();
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

    const apiUrl = `${API_URL}/api/v1/like?uuid=${uid}&isliked=1`;

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
    //removeEmptyOutputs();
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

        // Check the error code and display the appropriate message
        if (
          errorCode === "auth/invalid-email" ||
          errorCode === "auth/user-not-found"
        ) {
          window.showToast("Can not find email");
        } else if (errorCode === "auth/wrong-password") {
          window.showToast("Password incorrect");
        } else {
          // Handle other errors if needed
          console.error(errorMessage);
        }
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
  const apiResponse = await fetch(
    `${API_URL}/api/v1/recents?user_token=${token}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const response = await apiResponse.json();
  console.log(response);

  response.forEach((item, index) => {
    document.querySelector(`#row${index + 1}`).style.display = "flex";
    if (
      item["log_query_fields"] !== null &&
      item["log_query_fields"].length > 0
    ) {
      // create a json from item["log_query_fields"] by splitting each item by '=='
      let fields_json = item["log_query_fields"].reduce((acc, curr) => {
        let [key, value] = curr.split("==");
        acc[key] = value;
        return acc;
      }, {});
      document.querySelector(`#row${index + 1} #name`).innerHTML =
        fields_json["product_name"];
      if (document.querySelector(`#row${index + 1} #type`)) {
        document.querySelector(`#row${index + 1} #type`).innerHTML =
          item["template"];
      }
      const timestamp = item["log_last_update"].toLocaleString();
      const date = new Date(timestamp);

      const options = {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };

      let readableTimestamp = date.toLocaleString("en-US", options);

      readableTimestamp = readableTimestamp.replace(/([ap])m/, (match) =>
        match.toUpperCase()
      );
      document.querySelector(`#row${index + 1} #modified`).innerHTML =
        readableTimestamp;
    } else {
      document.querySelector(`#row${index + 1} #name`).innerHTML = "No name";
      document.querySelector(`#row${index + 1} #type`).innerHTML = "No type";
      document.querySelector(`#row${index + 1} #modified`).innerHTML =
        "No Date";
    }
  });

  document.addEventListener("click", async function (event) {
    let target = event.target;
    while (target && !target.id.includes("row")) {
      target = target.parentElement;
    }
    if (target && target.id.includes("row")) {
      var rowId = target.id.match(/\d+/)[0];

      const user_token = await myGlobalUser.getIdToken();

      window.location.href = `${response[rowId - 1]["template"]}?recentUuid=${
        response[rowId - 1]["main_uuid"]
      }`;
    }
  });
};

async function fillInputFieldsFromUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);

  const uuid = urlParams.get("recentUuid");
  const token = await myGlobalUser.getIdToken();

  //assign this fetch `${API_URL}/api/v1/recentUuid?uuid=${uuid}&user_token=${token}` to a json
  const apiResponse = await fetch(
    `${API_URL}/api/v1/recentUuid?uuid=${uuid}&user_token=${token}`
  );

  const response = await apiResponse.json();

  const fields = response[0]["log_query_fields"];
  const outputs = response[0]["output_matchers"];

  fields.forEach((value) => {
    const myKey = value.split("==")[0];
    const myValue = value.split("==")[1];
    let node = document.querySelector(`#${myKey}`);

    if (node.type === "text") {
      node.value = myValue;
    } else {
      let optionExists = Array.from(node.options).some(
        (option) => option.value === myValue
      );
      if (!optionExists) {
        let option = document.createElement("option");
        option.value = myValue;
        option.text = myValue;
        node.appendChild(option);
      }
      node.value = myValue;
    }
  });

  let index = 0;
  outputs.forEach((output) => {
    let newOutput = null;
    if (
      getComputedStyle(document.querySelector("#output_0")).display === "none"
    ) {
      newOutput = document.querySelector("#output_0");
    } else {
      newOutput = deepCopyResponseDiv(document.querySelector("#output_0"));
      document.querySelector("#output_0").parentNode.appendChild(newOutput);
    }
    newOutput.style.display = "block";
    newOutput.querySelector(`#myOutputText_${window.uids.length}`).innerHTML =
      output["response"].replace(/\n/g, "<br>");
    newOutput.id = `output_${index}`;
    newOutput.querySelector("#variantNo").innerText = `Variant - ${index + 1}`;
    index++;
    window.uids.push(output["uuid"]);
  });
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
  originalToast.parentNode.prepend(toastClone);
  toasts.push(toastClone);

  toastClone.style.transition = "opacity 0.5s ease";

  setTimeout(() => {
    toastClone.style.opacity = "0";
    setTimeout(() => {
      originalToast.parentNode.removeChild(toastClone);
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
  let apiData = await response.json();
  const monthly_allowed = apiData["metadata"]["monthly_allowance"];
  apiData = apiData["data"];
  const data = apiData.slice(-5);
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
  usedWord.innerHTML += `${monthly_allowed}`;
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
    prod_PnHr78eyKNmQXw: "elite_yearly",
    prod_QBJichLNSTxMa7: "super_yearly",
    prod_QBJjzr2UUg3OsW: "big_yearly",
    prod_QBJkBYtvXa4H9h: "professional_yearly",
    prod_QBJk5YLRHgta2z: "limited_yearly",
    prod_QBJi4twX9AWEd2: "elite_monthly",
    prod_QBJi8ti9U6Aqol: "super_monthly",
    prod_QBJkZt91urkrjs: "big_monthly",
    prod_QBJksLRlka1Uva: "professional_monthly",
    prod_QBJhDI16DLqSHU: "limited_monthly",
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

            document.querySelector("#billing_info_plan_name").innerText =
              document.querySelector(`#${product} > h5`).innerText;
            document.querySelector("#billing_info_plan_details").innerText =
              data.end_date;

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
let url = new URL(window.location.href);

if (url.pathname === "/confirmed") {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const actionCode = params.get("oobCode");

  // Handle the action from the email
  if (mode === "verifyEmail" && actionCode) {
    firebase
      .auth()
      .applyActionCode(actionCode)
      .then(function (response) {
        // Email verified successfully!
        document.getElementById("status").textContent =
          "Email address has been successfully verified.";
      })
      .catch(function (error) {
        // Handle or display error
        document.getElementById("status").textContent =
          "Error verifying email: " + error.message;
      });
  } else {
    document.getElementById("status").textContent =
      "Invalid request. Please check the link or contact support if the issue persists.";
  }
}
