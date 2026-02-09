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
