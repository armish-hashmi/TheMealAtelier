<!-- <?php
// Database connection
$conn = new mysqli("localhost", "root", "1234", "meal_atelier_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handling Sign-up and Sign-in logic
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    if ($action === 'signup') {
        $user = $_POST['username'];
        $email = $_POST['email'];
        $pass = password_hash($_POST['password'], PASSWORD_DEFAULT);
        
        $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $user, $email, $pass);
        echo ($stmt->execute()) ? "Success" : "Error";
    }
}
?>
<?php
// This runs BEFORE the page reaches the browser
include 'connect.php'; 
$result = $conn->query("SELECT COUNT(*) as total FROM grocery_list");
$row = $result->fetch_assoc();
$total_items = $row['total'];
?> -->