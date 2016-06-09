package io.github.keijokapp.valuutakalkulaator.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class DateService {

	final private static Logger logger = LoggerFactory.getLogger(DateService.class);

	public LocalDate getDate(LocalDate date) {

		LocalDateTime currentTime = LocalDateTime.now();

		if(date.isEqual(LocalDate.from(currentTime))) {
			if(currentTime.getHour() < 13) {
				logger.debug("subtracting one day from {}", date);
				date = date.minus(1, ChronoUnit.DAYS);
			}
		}
		return date;
	}
}
