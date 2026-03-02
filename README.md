# SYBAR (Search Your Best Available Route)
An AI-powered route planning mobile app that integrates centralized payment tracking to help you save your time by planning the best routes and track transactions history without hassle to juggle through multiple apps.

## Problem Statements
1. Lack of route optimization in route planning leads to traffic congestion, which leads to carbon emissions and environmental impact.
2. Multi-destinations route planning is not available in public transport context.
3. Payment is separated with maps and user struggle to keep track in transactions.

## Purposes
1. To develop a route planning module that incorporates Google's Gemini AI model to optimize routes based on a set of locations provided by the user.
2. To cater for multiple main travel modes (driving, two-wheeler, transit) in the route planning module.
3. To develop an integrated and centralized payment tracking module, it tracks transactions like tolls, parking fees and more.

## SDGs
- SDG 11: Sustainable Cities and Communities
  - Target 11.2
  - Using AI to mathematically optimize the complex "Traveling Salesman" problem for everyday drivers, the app acts as a digital upgrade to physical road networks
  - SYBAR integrates "transit" and "two-wheeler" modes alongside driving, thus encouraging the use of diverse and sustainable transport options
- SDG 13: Climate Action
  - Target 13.2
  - Utilize Gemini for route optimization, which facilitates better route planning and contributes to reduced traffic congestion and carbon emissions, thus alleviating the environmental impact
  - Provides the tool for individuals and businesses to implement strategies and directly integrating climate-conscious-decision-making into daily route planning.
- SDG 9: Industry, Innovation & Infrastructure
  - Target 9.1
  - Incorporating integrated payment systems for tolls and parking
  - Serving as a digital innovation that enhances the resilience and efficiency of urban mobility infrastructure

## Google Technology Used
- Gemini 3 Flash Preview Model
- Google Maps Geocoding API
- Google Maps Places API (Search Autocomplete)
- Google Maps Routes API
- Firebase Authentication

## Google Developer Tools / Platforms Used
- Google Cloud Platform
- Google AI Studio
- Firebase Studio

## Technical Implementation
**Google Maps Geocoding API** 
- To retrieve accurate details of a location with its latitude and longitude (formatted_address and place_id)
- We used it to retrieve details of user's current location

**Google Maps Places API (Search Autocomplete)**
- To facilitate location searching by providing location suggestion list based on user input and retrieve accurate details of the selected location
- We used it to allow users to enter the location name or address partially, and select the desired location from the suggestion list. This also ensures that the location details are accurate and unambiguous

**Gemini 3 Flash Preview Model API**
- To optimize the location order of the set of destinations provided by users, and return the response to prepare for the API request to call Google Maps Routes API
- We fix a travel mode (driving, two-wheeler, transit) and a starting point, and provide a set of destinations in random sequence. Then, Gemini will have to provide the best and most optimized route based on the given details. We will parse the Gemini JSON response and form an appropriate Google Maps Routes API request format with the details.

**Google Maps Routes API**
- To retrieve the best available route based on the given set of locations and travel mode.
- We pass the optimized sequence of locations, travel mode, departure time (if present) into Google Maps Routes API, then retrieve the response to display the route on the map, display the routes details and navigation instructions for each stop/leg in our Route Details Card

**Firebase Authentication**
- To implement and enable easy user authentication and secure user management.
- We implemented it for our login and sign-up process. Email/password is our app's sign-in method.

## Technical Setup

**1. Clone the repository.** Open your terminal and run the following command to clone the project to your local machine:\
`Bash`
```bash
git clone https://github.com/Kingsleylyh/SYBAR.git
```

**2. Open the project folder in your IDE and change directory into SYBAR folder.**\
`Bash`
```cd
cd SYBAR
```
The directory should look like this `.../SYBAR/SYBAR`

**3. Install all the dependencies.**\
`Bash`
```bash
npx expo install
```

**4. Create an `.env` file and insert your Google Maps API Key for Android and iOS, and your Gemini API Key.**
Remember to create in this `.../SYBAR/SYBAR` root directory. There is an `.env.template` file for reference.\
`.env`
```.env
GOOGLE_MAPS_API_KEY_ANDROID=
GOOGLE_MAPS_API_KEY_IOS=
GEMINI_API_KEY=
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

**5. To run the project, use this command:**\
`Bash`
```bash
npx expo start -c
```

**6. Install Expo Go on your test phone and connect the test phone to your laptop or computer.**
You can either scan the QR code or insert the localhost link generated by Expo when starting the project in Step 4.\
You can also type this command in the IDE terminal to open the app on your test phone.\
`a` (Open Android)\
`i` (Open iOS, requires other setup like XCode)\
It will run the build and open on your test phone's Expo Go.

**7. Login to Expo Go.**
Once you scanned the QR, the terminal will show a confirmation as below:\
`Node`
```node
> Log in
  Proceed anonymously
```
You should use arrow keys to choose proceed anonymously to start the building, or log in to Expo Go on your test phone before running the project.

**8. If there is error or it's loading for a long time, please retry using this command:**\
- Retry using command `a` or `i` (can exit & close the application and retry with the command) or\
- Retry using command `r` for reloading app
