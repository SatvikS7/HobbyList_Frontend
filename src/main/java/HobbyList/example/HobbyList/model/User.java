package HobbyList.example.HobbyList.model;

import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.ArrayList;
import java.util.HashSet;

@Entity
@Table(name = "users")
@Data
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    // @Column(nullable = false)
    private String firstname;

    // @Column(nullable = false)
    private String lastname;

    @Column(nullable = false)
    private String displayName = "dummy";

    @Column(nullable = false, unique = true)
    private String email;

    private String username;

    @Column(nullable = false)
    private String password;

    private String role;
    private boolean active = false;
    private String profileUrl;
    private String description;

    @Column(nullable = false)
    private boolean isPrivate = true;

    @Column(nullable = false)
    private boolean newAccount = true;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> hobbies = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos;

    @OneToOne
    private VerificationToken token;

    @ManyToMany
    @JoinTable(name = "user_followers", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "follower_id"))
    private Set<User> followers = new HashSet<>();

    @ManyToMany(mappedBy = "followers")
    private Set<User> following = new HashSet<>();

    public User() {
    }

    public User(long id, String firstname, String lastname, String displayName, String email, String password,
            String role) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.displayName = displayName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public void setOld() {
        this.newAccount = false;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof User))
            return false;
        return id != 0 && id == ((User) o).getId();
    }

    @Override
    public int hashCode() {
        return Long.hashCode(id);
    }

}