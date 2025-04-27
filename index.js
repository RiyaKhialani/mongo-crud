const { MongoClient } = require("mongodb");
const readline = require("readline");

const uri = "mongodb://127.0.0.1:27017"; // MongoDB must be running locally
const client = new MongoClient(uri);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function connectDB() {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    return client.db("companyDB").collection("employees");
}

async function addEmployee(collection) {
    const name = await askQuestion("Enter Employee Name: ");
    const age = await askQuestion("Enter Employee Age: ");
    const position = await askQuestion("Enter Employee Position: ");
    const salary = await askQuestion("Enter Employee Salary: ");

    const employee = { name, age: parseInt(age), position, salary: parseFloat(salary) };
    await collection.insertOne(employee);
    console.log("✔️ Employee Added:", employee);
}

async function getAllEmployees(collection) {
    const employees = await collection.find().toArray();
    console.log("📄 Employees List:", employees);
}

async function updateEmployee(collection) {
    const name = await askQuestion("Enter Employee Name to Update: ");
    const newPosition = await askQuestion("Enter New Position: ");
    const newSalary = await askQuestion("Enter New Salary: ");

    const result = await collection.updateOne(
        { name },
        { $set: { position: newPosition, salary: parseFloat(newSalary) } }
    );

    if (result.modifiedCount > 0) {
        console.log("✔️ Employee Updated!");
    } else {
        console.log("❌ Employee not found.");
    }
}

async function deleteEmployee(collection) {
    const name = await askQuestion("Enter Employee Name to Delete: ");
    const result = await collection.deleteOne({ name });

    if (result.deletedCount > 0) {
        console.log("❌ Employee Deleted!");
    } else {
        console.log("❌ Employee not found.");
    }
}

async function main() {
    const collection = await connectDB();

    while (true) {
        console.log("\nChoose an option:");
        console.log("1. Add Employee");
        console.log("2. View Employees");
        console.log("3. Update Employee");
        console.log("4. Delete Employee");
        console.log("5. Exit");

        const choice = await askQuestion("Enter choice: ");

        switch (choice) {
            case "1":
                await addEmployee(collection);
                break;
            case "2":
                await getAllEmployees(collection);
                break;
            case "3":
                await updateEmployee(collection);
                break;
            case "4":
                await deleteEmployee(collection);
                break;
            case "5":
                console.log("👋 Exiting...");
                await client.close();
                rl.close();
                return;
            default:
                console.log("❌ Invalid choice! Try again.");
        }
    }
}

main();
