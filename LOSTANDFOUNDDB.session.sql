ALTER TABLE claims
MODIFY COLUMN status ENUM('pending', 'Approved', 'Rejected') DEFAULT 'pending';
