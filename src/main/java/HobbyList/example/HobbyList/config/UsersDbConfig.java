package HobbyList.example.HobbyList.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;

import javax.sql.DataSource;


@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "HobbyList.example.HobbyList.repository.user",
    entityManagerFactoryRef = "usersEntityManager",
    transactionManagerRef = "usersTransactionManager"
)
public class UsersDbConfig {

    @Primary
    @Bean
    public LocalContainerEntityManagerFactoryBean usersEntityManager(
            @Qualifier("usersDataSource") DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("HobbyList.example.HobbyList.model.user");
        em.setPersistenceUnitName("user");

        JpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);

        return em;
    }

    @Primary
    @Bean
    public PlatformTransactionManager usersTransactionManager(
            @Qualifier("usersEntityManager") EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}
