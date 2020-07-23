[![TestRail v4.1](https://img.shields.io/badge/TestRail%20API-v2-green.svg)](http://docs.gurock.com/testrail-api2/start)

# Jest2TestRail

This package allows you to use [Jest](https://jestjs.io/) in conjunction with [TestRail](http://www.gurock.com/testrail/).

It can automatically create a new test runs on TestRail for multiple suites and send results.

## Install

```code
npm i @rankery/jest-2-testrail
```

## Example - **jest-config.js**

The Reporter must be specified in the Jest config file (jest-config.js), under 'reporters'.
<br>Parameter is defined as 'project_id', which is the id of your project on TestRail.

```javascript
module.exports = {
  ...
  reporters: [
    ["jest-2-testrail", { project_id: "1" }]
  ]
};
```

## Example - tests

The Suite ID from TestRail must be added to the start of top _describe()_ description, <br>and separated from the test name by a colon - ":".

The Case ID from TestRail must be added to the start of each _it()_ description, <br>and separated from the test name by a colon - ":".

```javascript
// "1:" this is Suite ID from Test Rail (Will work only for top)
describe("1: Suite 1", () => {
  // "11:" this is Case ID from Test Rail
  it("11: Test success", async () => {
    expect(1).toBe(1);
  });

  it("12: Test fail", async () => {
    expect(1).toBe(0);
  });

  xit("13: Test skip", async () => {
    expect(1).toBe(1);
  });
});
```

**Note:** The Case ID is a unique and permanent ID of every test case (e.g. C125),
<br>and shoudn't be confused with a Test Case ID, which is assigned to a test case<br> when a new run is created (e.g. T325).

## ENV requirements 

Project needs 3 parameters to work correctly with testrail

```javascript
TESTRAIL_URL = https://<YourProjectURL>.testrail.io
TESTRAIL_USERNAME = email address
TESTRAIL_PASSWORD = password or API key
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
