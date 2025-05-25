<?php
$conn = new mysqli("localhost", "root", "", "contact_db");
$result = $conn->query("SELECT * FROM contacts ORDER BY created_at DESC");
?>

<h2>Contact Messages</h2>
<?php while($row = $result->fetch_assoc()): ?>
    <div style="border:1px solid #aaa; margin:10px; padding:10px;">
        <p><b>Name:</b> <?= $row['name'] ?></p>
        <p><b>Email:</b> <?= $row['email'] ?></p>
        <p><b>Message:</b> <?= $row['message'] ?></p>
        <p><b>Reply:</b> <?= $row['reply'] ?: "No reply yet" ?></p>
        <form action="/admin/reply_contact.php" method="POST">
            <input type="hidden" name="id" value="<?= $row['id'] ?>">
            <textarea name="reply" placeholder="Your reply here..."></textarea><br>
            <button type="submit">Send Reply</button>
        </form>
    </div>
<?php endwhile; ?>
