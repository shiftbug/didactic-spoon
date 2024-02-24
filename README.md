# didactic-spoon
Shared Repo to Craft Intelligence


**Welcome**

# 

## Introduction

This repository contains the necessary components for a web-based text editing application that integrates with OpenAI. The primary objective of the application is to assist authors by providing instantaneous feedback, critique on their work, and offering branching ideas. Furthermore, the application aims to provide structured outputs in future updates. The user interface is designed to be intuitive and user-friendly, allowing users to edit text files and interact with OpenAI effectively. Yeah, it's mmore than that, but OK.

## Roadmapish

Consider a few notions of continued improvement.  1) The Modules are where the magic happens here. The modules need updated with default model settings and Optional override using the control panel, and to accept input from other selected modules vs. direct from text entry. 2) The next major step is a module composer. This means individualized prompt and setting framework setup savable to the module selection panel. 3) the face of the app can use more functionality → like arrows to send data between modules or text entry, editing. 4) An output mapping composer which allows the user to link certain modules together ALONG WITH particular output structures e.g. training data sets, twitter campaign scheduling, youtube video scripting or even generation, TTS generation, blog construction etc. 5) Structured model responses with validation using Instructor https://github.com/jxnl/instructor.

## Repository Structure

### Core Files

<img width="1168" alt="Screenshot" src="https://github.com/shiftbug/didactic-spoon/assets/129222365/3cf88e42-4a69-45a7-9560-97ae5e196fc8">


### `index.html`

`index.html` is the primary user interface file containing the HTML structure of the web application. It creates a well-structured layout that includes the main text editing area, a control panel for adjusting OpenAI parameters, and the modules residing in the right panel. The modules are designed to showcase the output of varied styles of prompting, enhancing the user's understanding and interaction with the system.

### `llm.py`

`llm.py` is a Python script housing the lower-level module code. It primarily functions to handle the OpenAI API calls. The script facilitates interaction with the OpenAI API, serving as a bridge between the user's input and the API's response. This file plays a crucial role in the backend functionality of the application.

### `app.py`

`app.py` is the main Python file that operates the Flask server, which handles server-side processing. This file manages several server-side functions like loading and saving files, processing text, and managing AJAX requests. Together with `llm.py`, it forms the backbone of the application's backend.

### `style.css`

`style.css` contains all the CSS styling rules applied to the web application. It shapes the visual appearance of the application, including colors, fonts, and layouts. This file ensures that the user interface is not just functional, but also aesthetically appealing.

## Running the Application

To run the application, follow these steps:

1. Clone this repository to your local machine.
2. Ensure you have the necessary dependencies installed. These may include Flask and any other packages used in `llm.py` and `app.py`.
3. Set your OpenAI API key as an environment variable using the command `export OPENAI_API_KEY=<your_api_key>`.
4. Run `app.py` to start the Flask server.
5. Open a web browser and navigate to the local address where the Flask server is running (usually `localhost:5000`).
6. The web application should now be up and running, ready for use.

## Troubleshooting & Feedback

In case you encounter any issues or bugs while using the application, please open an issue on the repository page. We value user feedback as it assists us in identifying areas for improvement and enhancing the overall user experience.

## Contributing

We welcome contributions to this project. If you're interested in improving the application or adding new features, please fork the repository and make a pull request with your proposed changes. We appreciate your help in making this application better.

## License

This project is licensed under the MIT License. For more details, please refer to the `LICENSE` file in the repository.
