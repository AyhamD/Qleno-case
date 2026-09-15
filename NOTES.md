# Notes

<!--
Fyll i den här filen medan du arbetar. Skriv gärna på svenska eller engelska,
välj det du är mest bekväm med.
-->

## Bugs I found

### 1. <Pagination in get consultants>

* **Where:** `src/routers/consultants.js`
* **Symptom:** Requesting `GET /api/consultants?page=1&pageSize=3` returns consultants starting from ID 4 instead of IDs 1, 2, and 3. Page 2 also skips ahead too far.
* **Root cause:** offset are calculated wrong
* **Fix:** change the offset to calculation to take the correct index
* **Test:** First test `GET /api/consultants?page=1&pageSize=3` i got 3 item that start with id [4,5,6] test 2 i got correct `GET /api/consultants?page=1&pageSize=3` was items with id [1,2,3] and `GET /api/consultants?page=2&pageSize=3` here i got item with id [4,5,6]


### 2. <total are wrong in get consultants>

* **Where:** `src/routers/consultants.js`
* **Symptom:** The response json return the total as it is items.length 
* **Root cause:** The total number are wrong
* **Fix:** we need to use the total instead here because we are looking in the total after filtering and sorting not the total items
* **Test:** I found it without testing but i could find it by calling `GET /api/consultants?page=1&pageSize=3` and the terminal will show log that show the error

### 3. <Available from query are string>

* **Where:** `src/routers/consultants.js`
* **Symptom:** query return value as string and it need to be handle
* **Root cause:** This can cause error on filter where "false" return true not false
* **Fix:** Fix it by calling in filter Available === 'true' otherwise it is "false"
* **Test:** I did 2 test one when Available are false and another when Available are true and i found the error where at the beginning it does not matter what i sort with give same result


### 4. Missing `await` when retrieving a consultant

* **Where:** `src/routes/consultants.js`
* **Symptom:** The endpoint returned a Promise instead of the requested consultant, and unknown IDs did not correctly return `404`.
* **Root cause:** `store.findConsultant(id)` is asynchronous but was called without `await`.
* **Fix:** Added `await` before `store.findConsultant(id)`.
* **Test:** First i called api/consultants/1 and got empty array then i tried to add text i got 400 so i figured it out that i am missing the await


### 5. <In post we send request 201 instead of 200>

* **Where:** `src/routes/consultants.js`
* **Symptom:**
* **Root cause:**
* **Fix:** Change to 201 instead of 200
* **Test:** Found it direct without test

### 6. <kort rubrik>

* **Where:** `src/routes/consultants.js`
* **Symptom:** The patch can change the id where we do not have check on what field are allowed to change
* **Root cause:** Using object assign direct from the body are wrong
* **Fix:** By creating array of items that are allowed to change, Then check if the user add anything else so we throw error. The id must by unik and it is primary key for database
* **Test:** Tested by trying to change the id and that worked. Since we are saving locally i terminated the server and run it again then added the logic. Tested again. Worked fine i could not change the id. 


### 7. <Start and end date>

* **Where:** `src/routes/assignments.js`
* **Symptom:** In create assignments dates are not validated before use.
* **Root cause:** 
* **Fix:** To handle as date and it should start and end be declared before check. One miner thing the start should not be before end date
* **Test:** I found the error when i tried to add new assignment

### 7. <error handler>

* **Where:** `src/app.js`
* **Symptom:** The error handler run before the routes.
* **Root cause:** The error handler run before the routes that make the throw error the handler do not work
* **Fix:** change the position
* **Test:** By going thought the application

## Things I chose not to do 

## Questions / assumptions
The assignment i think should have date as Sat Sep 13 275760 00:00:00 GMT+0000 (Coordinated Universal Time) so it can take few hours instead of D/m/yyyy 