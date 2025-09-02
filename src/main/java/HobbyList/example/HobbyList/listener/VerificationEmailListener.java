package HobbyList.example.HobbyList.listener;

import org.springframework.scheduling.annotation.Async;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import HobbyList.example.HobbyList.dto.VerificationEmailEvent;
import HobbyList.example.HobbyList.service.VerificationService;

@Component
public class VerificationEmailListener {

    private final VerificationService verificationService;

    public VerificationEmailListener(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @Async
    @EventListener
    public void handleVerificationEmailEvent(VerificationEmailEvent event) {
        verificationService.sendVerificationEmail(event.user(), event.type());
    }
}
