[![TestRail v4.1](https://img.shields.io/badge/TestRail%20API-v2-green.svg)](http://docs.gurock.com/testrail-api2/start)

# Testrail reporter for Jest

## Description

[TestRail](https://www.gurock.com/testrail/) module for [Jest](https://jestjs.io/)

It can automatically create a new test runs on TestRail for multiple suites and send results.


## Install

```code
npm i @giteshdohare/testrail-jest-reporter
```

## Example - **jest-config.js**

The Reporter must be specified in the Jest config file (jest-config.js), under 'reporters'.

```javascript
module.exports = {
  ...
  reporters: [
    ["@giteshdohare/testrail-jest-reporter"]
  ]
};
```

## Example - tests

The Suite ID from TestRail must be added to the start of top _describe()_ description, ID should be in *TestRail[**ID**]*.

The Case ID from TestRail must be added to the start of each _it()_ description, ID should be in *TestRail[**ID**]*.

```javascript
// "1:" this is Suite ID from Test Rail (Will work only for top)
describe("TestRail[1] Suite", () => {
  // "11:" this is Case ID from Test Rail
  it("TestRail[11] Test success", async () => {
    expect(1).toBe(1);
  });

  it("TestRail[12] Test fail", async () => {
    expect(1).toBe(0);
  });

  xit("TestRail[13] Test skip", async () => {
    expect(1).toBe(1);
  });
});
```

**Note:** The Case ID is a unique and permanent ID of every test case (e.g. C125),
<br>and shoudn't be confused with a Test Case ID, which is assigned to a test case<br> when a new run is created (e.g. T325).

**Note**: Test run will not be added if Case ID/Suite ID is incorrect.

## ENV requirements 

Project needs 4 parameters to work correctly with testrail

```javascript
TESTRAIL_URL = https://<YourProjectURL>.testrail.io
TESTRAIL_USERNAME = email address
TESTRAIL_PASSWORD = password or API key
TESTRAIL_PROJECT_ID = 1
```
## Credit
Forked from: https://github.com/jest-reporters/testrail
<br/>
Orginal Author: [@rankery](https://github.com/rankery)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
