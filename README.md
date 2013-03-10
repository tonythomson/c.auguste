#Implementing the REST API

C.Auguste's REST API consists of the following methods:
(note that this is a work-in-progress)

<table>
  <tr>
    <td>Method</td>
    <td>URL</td>
    <td>Action</td>
  </tr>

  <tr>
    <td>GET</td>
    <td>/companies</td>
    <td>Retrieve all companies</td>
  </tr>

  <tr>
    <td>GET</td>
    <td>/companies/1000275</td>
    <td>Retrieve the company with the specified CIK</td>
  </tr>

  <tr>
    <td>POST</td>
    <td>/companies</td>
    <td>Add a new company</td>
  </tr>

  <tr>
    <td>PUT</td>
    <td>/companies/1000275</td>
    <td>Update the company with the specified CIK</td>
  </tr>

  <tr>
    <td>DELETE</td>
    <td>/companies/1000275</td>
    <td>Delete the company with the specified CIK</td>
  </tr>

</table>