package HobbyList.example.HobbyList.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .formLogin()
                    .loginPage("/login")
                    .permitAll()
                .and()
                .authorizeRequests()
                    .antMatchers("/req/signup").permitAll()
                    .anyRequest().authenticated()
                .and()
                .build();
    }
}
