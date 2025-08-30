package HobbyList.example.HobbyList.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.HashMap;

import javax.sql.DataSource;


@Configuration
//@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "HobbyList.example.HobbyList.repository.user",
    entityManagerFactoryRef = "usersEntityManager",
    transactionManagerRef = "usersTransactionManager"
)
public class UsersDbConfig {

    @Autowired
    private Environment env;

    @Primary
    @Bean
    public DataSource usersDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(env.getProperty("DB_DRIVER_CLASS"));
        dataSource.setUrl(env.getProperty("DB_BASE_URL") + "users");
        dataSource.setUsername(env.getProperty("DB_USER"));
        dataSource.setPassword(env.getProperty("DB_PASSWORD"));
        return dataSource;
    }

    @Primary
    @Bean
    public LocalContainerEntityManagerFactoryBean usersEntityManager() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(usersDataSource());
        em.setPackagesToScan(new String[]{"HobbyList.example.HobbyList.model.user"});
        em.setPersistenceUnitName("users");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);

        HashMap<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto",
          env.getProperty("DB_DDL_AUTO"));
        properties.put("hibernate.dialect",
          env.getProperty("DB_DIALECT"));
        em.setJpaPropertyMap(properties);

        return em;
    }

    @Primary
    @Bean
    public PlatformTransactionManager usersTransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(usersEntityManager().getObject());
        return transactionManager;
    }
}
