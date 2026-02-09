# Vibeathon_code_cookers

Prompts 1:
make a python function to get text as input. 
and use gemini api to classify it among these categories.
Police , Ambulance , or  FireStation. 

also classify the severity as ;
Low , Medium, High, Critical .

also give the summery and of the message, and make it better .

the output format of this gemini api should be  :
{category : value , severity : value, message : value }

then edit the json and add a timestamp string to it.

final output of the function will be : 
{category : string, severity : string, message : string, timestamp : string}

the ai model should always give the output from these defined categories, as a json format. nothing else . 
even if the info is irrelevent , it should catogorise it into the defined values. 
and follow the string output format .


Propmt 2 : 
All support for the `google.generativeai` package has ended. It will no longer be receiving 
updates or bug fixes. Please switch to the `google.genai` package as soon as possible.
See README for more details:

https://github.com/google-gemini/deprecated-generative-ai-python/blob/main/README.md

  import google.generativeai as genai
c:\Users\VenkatPrashad\Coding\hackathon\vibathon\ai.py:67: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).   

  "timestamp": datetime.utcnow().isoformat()

just use the post req for this. no need the package


Prompt 3:

<!DOCTYPE html>
<html>
<head>
<title>Police Dashboard</title>
<style>
body { font-family: Arial; padding: 40px; }
.card { border:1px solid black; padding:15px; margin:10px; }
</style>
</head>
<body>

<h2>firestation</h2>
<div id="data"></div>

<script>
fetch("http://127.0.0.1:5000/get/FireStation")
.then(res => res.json())
.then(data => {
    const div = document.getElementById("data");
    data.forEach(item => {
    div.innerHTML += `
    <div class="card">
        <h3>${item.title}</h3>
        <p>${item.message}</p>
        <p>Severity: ${item.severity}</p>
        <p>${item.timestamp}</p>
        ${item.image ? `<img src="${item.image}" width="300">` : ""}
    </div>`;
});

});
</script>

</body>
</html>


make this design good, and format css .

make good animations. dont change any logic

Promopt 4:

<!DOCTYPE html>
<html>
<head>
<title>Raise Complaint</title>
<style>
body { font-family: Arial; padding: 40px; }
input, textarea { width: 100%; padding: 10px; margin: 10px 0; }
button { padding: 10px 20px; background: red; color: white; border: none; }
</style>
</head>
<body>

<h2>Raise Emergency Complaint</h2>

<form id="complaintForm" enctype="multipart/form-data">
<input type="text" name="title" placeholder="Title" required>
<textarea name="description" placeholder="Describe the emergency" required></textarea>
<input type="file" name="image">
<button type="submit">Submit</button>
</form>

<script>
document.getElementById("complaintForm").onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    await fetch("http://127.0.0.1:5000/file-complaint", {
        method: "POST",
        body: formData
    });

    alert("Complaint Submitted!");
};
</script>

</body>
</html>


just make this look good. dont change any logic.

add more animation .
