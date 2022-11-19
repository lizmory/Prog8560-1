# Prog8560-1
#Car school application:    What does it consist of?
#Car school application allows to register students in the driving course and establish who has approved it, 
#who has disapproved it and who is in the process. The system allows students to enroll with identification, name, age, 
# address and telephone number. In addition, it allows to consult the students enrolled and their current status: approved, 
#disapproved, in progress. The query can be made by student by typing their identification or by printing a list of approved students, 
#a list of disapproved students and a list of students in progress. In queries by lists, the application shows the net results and in percentages results.

#IMPLEMENTATION: The application is implemented using object-oriented programming. It is composed of two classes: the Student class and the School class.
# Student class: the student class has the instance attributes id, name, age, address and phone. Contains the instance method called printStudent too that 
# allows to print the student data by console and to a text file. School class: It has an instance attribute called students, which is a dictionary that has 
# the student IDs as keys and an instance of the student class as value.
