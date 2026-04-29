package com.soldmate.seed;

import com.soldmate.auth.User;
import com.soldmate.auth.UserRepository;
import com.soldmate.company.Company;
import com.soldmate.company.CompanyRepository;
import com.soldmate.company.CompanySettingsService;
import com.soldmate.incidents.Incident;
import com.soldmate.incidents.IncidentRepository;
import com.soldmate.inventory.Product;
import com.soldmate.inventory.ProductRepository;
import com.soldmate.inventory.Supplier;
import com.soldmate.inventory.SupplierRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final IncidentRepository incidentRepository;
    private final CompanySettingsService settingsService;
    private final PasswordEncoder passwordEncoder;

    @Value("${soldmate.seed.enabled:true}")
    private boolean seedEnabled;

    public DemoDataSeeder(CompanyRepository companyRepository,
                          UserRepository userRepository,
                          SupplierRepository supplierRepository,
                          ProductRepository productRepository,
                          IncidentRepository incidentRepository,
                          CompanySettingsService settingsService,
                          PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.incidentRepository = incidentRepository;
        this.settingsService = settingsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }

        Company demoCompany = ensureCompany("B00000001", "La Terraza Demo", "ES");
        User owner = ensureUser(demoCompany, "owner.demo@soldmate.local", "Paula", "Roman", User.Role.OWNER);
        User staff = ensureUser(demoCompany, "staff.demo@soldmate.local", "Mario", "Lopez", User.Role.STAFF);

        if (settingsService.getAllSettings(demoCompany.getId()).isEmpty()) {
            settingsService.createDefaultSettings(demoCompany);
        }

        ensureSupplier(demoCompany, "Distribuciones Iberica", "Bebidas");
        ensureSupplier(demoCompany, "Mercado Fresco SL", "Alimentacion");
        ensureSupplier(demoCompany, "Limpieza Hosteleria Plus", "Limpieza");

        ensureProduct(demoCompany, "Tomate triturado lata", "Alimentacion", Product.Unit.UNIT, "10.00", "24.000", "15.000");
        ensureProduct(demoCompany, "Aceite de oliva virgen", "Alimentacion", Product.Unit.L, "10.00", "5.000", "8.000");
        ensureProduct(demoCompany, "Cerveza barril 30L", "Bebidas", Product.Unit.BOX, "21.00", "3.000", "4.000");
        ensureProduct(demoCompany, "Detergente cocina", "Limpieza", Product.Unit.UNIT, "21.00", "12.000", "6.000");
        ensureProduct(demoCompany, "Servilletas 40x40", "Envases", Product.Unit.BOX, "21.00", "2.000", "3.000");

        if (!incidentRepository.existsByCompanyId(demoCompany.getId())) {
            createIncident(demoCompany, owner, "Fuga leve en camara frigorifica", "Revisar junta de puerta", Incident.Priority.HIGH, Incident.Status.OPEN);
            createIncident(demoCompany, staff, "Campana extractora con ruido", "Vibracion al arrancar en velocidad alta", Incident.Priority.MEDIUM, Incident.Status.IN_PROGRESS);
            createIncident(demoCompany, owner, "Mantenimiento preventivo horno", "Revision trimestral completada", Incident.Priority.LOW, Incident.Status.CLOSED);
        }
    }

    private Company ensureCompany(String taxId, String name, String country) {
        return companyRepository.findByTaxId(taxId).orElseGet(() -> {
            Company company = new Company();
            company.setTaxId(taxId);
            company.setName(name);
            company.setCountry(country);
            company.setCurrency("EUR");
            company.setSubscriptionTier(Company.SubscriptionTier.PREMIUM);
            return companyRepository.save(company);
        });
    }

    private User ensureUser(Company company, String email, String firstName, String lastName, User.Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setCompany(company);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(role);
            user.setPassword(passwordEncoder.encode("Demo12345!"));
            return userRepository.save(user);
        });
    }

    private void ensureSupplier(Company company, String name, String category) {
        supplierRepository.findByCompanyIdAndNameIgnoreCase(company.getId(), name).orElseGet(() -> {
            Supplier supplier = new Supplier();
            supplier.setCompany(company);
            supplier.setName(name);
            supplier.setCategory(category);
            supplier.setContactEmail("compras@" + company.getName().toLowerCase().replace(" ", "") + ".local");
            supplier.setContactPhone("+34900000111");
            supplier.setActive(true);
            return supplierRepository.save(supplier);
        });
    }

    private void ensureProduct(Company company, String name, String category, Product.Unit unit, String vatRate, String currentStock, String minStock) {
        productRepository.findByCompanyIdAndNameIgnoreCase(company.getId(), name).orElseGet(() -> {
            Product product = new Product();
            product.setCompany(company);
            product.setName(name);
            product.setCategory(category);
            product.setUnit(unit);
            product.setVatRate(new BigDecimal(vatRate));
            product.setCurrentStock(new BigDecimal(currentStock));
            product.setMinStock(new BigDecimal(minStock));
            return productRepository.save(product);
        });
    }

    private void createIncident(Company company, User reporter, String title, String description, Incident.Priority priority, Incident.Status status) {
        Incident incident = new Incident();
        incident.setCompany(company);
        incident.setReportedBy(reporter);
        incident.setTitle(title);
        incident.setDescription(description);
        incident.setPriority(priority);
        incident.setStatus(status);
        incidentRepository.save(incident);
    }
}
