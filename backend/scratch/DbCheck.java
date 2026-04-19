import java.sql.*;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/academic_db";
        String user = "postgres";
        String password = "postgres";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to the database!");
            
            // Query users
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT email, name FROM users")) {
                System.out.println("Users in database:");
                while (rs.next()) {
                    System.out.println("- " + rs.getString("email") + " (" + rs.getString("name") + ")");
                }
            }

            // Query flyway_schema_history
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT version, description, success FROM flyway_schema_history")) {
                System.out.println("\nFlyway History:");
                while (rs.next()) {
                    System.out.println("- v" + rs.getString("version") + ": " + rs.getString("description") + " (Success: " + rs.getBoolean("success") + ")");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
