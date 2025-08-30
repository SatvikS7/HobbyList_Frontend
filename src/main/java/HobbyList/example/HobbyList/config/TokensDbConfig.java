package HobbyList.example.HobbyList.config;

import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
    basePackages = "HobbyList.example.HobbyList.repository.token",
    entityManagerFactoryRef = "tokensEntityManager",
    transactionManagerRef = "tokensTransactionManager"
)
public class TokensDbConfig {

    @Autowired
    private Environment env;

    @Bean
    public DataSource tokensDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(env.getProperty("DB_DRIVER_CLASS"));
        dataSource.setUrl(env.getProperty("DB_BASE_URL") + "verification_tokens");
        dataSource.setUsername(env.getProperty("DB_USER"));
        dataSource.setPassword(env.getProperty("DB_PASSWORD"));
        return dataSource;
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean tokensEntityManager() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(tokensDataSource());
        em.setPackagesToScan(new String[]{"HobbyList.example.HobbyList.model.token"});
        em.setPersistenceUnitName("tokens");

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
    

    @Bean
    public PlatformTransactionManager tokensTransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(tokensEntityManager().getObject());
        return transactionManager;
    }
}

