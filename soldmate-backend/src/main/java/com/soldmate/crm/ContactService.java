package com.soldmate.crm;

import com.soldmate.company.Company;
import com.soldmate.company.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;

    public ContactService(ContactRepository contactRepository,
                          CompanyRepository companyRepository) {
        this.contactRepository = contactRepository;
        this.companyRepository = companyRepository;
    }

    // ─── Lectura ─────────────────────────────────────────────────────────────

    public List<Contact> getAll(Long companyId) {
        return contactRepository.findByCompanyIdOrderByFullNameAsc(companyId);
    }

    public Contact getById(Long companyId, Long id) {
        return contactRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new RuntimeException("Contacto no encontrado: " + id));
    }

    // ─── Creación ─────────────────────────────────────────────────────────────

    public Contact create(Long companyId, ContactRequest req) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new RuntimeException("Empresa no encontrada: " + companyId));

        Contact contact = new Contact();
        contact.setCompany(company);
        applyRequest(contact, req);

        return contactRepository.save(contact);
    }

    // ─── Actualización ────────────────────────────────────────────────────────

    public Contact update(Long companyId, Long id, ContactRequest req) {
        Contact contact = getById(companyId, id);
        applyRequest(contact, req);
        return contactRepository.save(contact);
    }

    public Contact toggleActive(Long companyId, Long id) {
        Contact contact = getById(companyId, id);
        contact.setActive(!contact.getActive());
        return contactRepository.save(contact);
    }

    // ─── Eliminación ─────────────────────────────────────────────────────────

    public void delete(Long companyId, Long id) {
        Contact contact = getById(companyId, id);
        contactRepository.delete(contact);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private void applyRequest(Contact c, ContactRequest req) {
        c.setFullName(req.fullName());
        if (req.email()      != null) c.setEmail(req.email());
        if (req.phone()      != null) c.setPhone(req.phone());
        if (req.avatarUrl()  != null) c.setAvatarUrl(req.avatarUrl());
        if (req.role()       != null) c.setRole(req.role());
        if (req.department() != null) c.setDepartment(req.department());
        if (req.location()   != null) c.setLocation(req.location());
        if (req.progress()   != null) c.setProgress(req.progress());
        if (req.active()     != null) c.setActive(req.active());
        if (req.notes()      != null) c.setNotes(req.notes());
        if (req.joinDate()   != null) c.setJoinDate(req.joinDate());
        if (req.rating()     != null) c.setRating(req.rating());
        if (req.projects()   != null) c.setProjects(req.projects());
    }

    // ─── DTO ─────────────────────────────────────────────────────────────────

    public record ContactRequest(
        String fullName,
        String email,
        String phone,
        String avatarUrl,
        String role,
        String department,
        String location,
        Integer progress,
        Boolean active,
        String notes,
        String joinDate,
        Double rating,
        String projects
    ) {}
}
